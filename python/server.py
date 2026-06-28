import asyncio
import queue
import threading
import time
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from engine.Pilot import Pilot
from core.startup import is_configured, run_onboarding, save_config, load_config
from ui import pilot_ui
import config


app = FastAPI(title="Pilot Local Server", version="0.1")

# Tauri's webview origin varies by platform; during development the
# Tauri devtools / localhost dev server also need access. Restrict
# this list once you know your production Tauri origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────────────────────
# Global state — intentionally a single instance. This server models
# "one user, one Pilot, one browser" — not a multi-session service.
# ──────────────────────────────────────────────────────────────────

pilot = Pilot()
_worker_thread: Optional[threading.Thread] = None
_log_queue: "queue.Queue" = queue.Queue()
_ws_clients: set[WebSocket] = set()


# ──────────────────────────────────────────────────────────────────
# Request/response models
# ──────────────────────────────────────────────────────────────────

class OnboardingPayload(BaseModel):
    groq_api_key: str
    username: str
    password: str
    phone_number: str


class StatusResponse(BaseModel):
    status: str          # idle | running | done | error
    error: Optional[str] = None
    configured: bool


# ──────────────────────────────────────────────────────────────────
# Background thread runner
# ──────────────────────────────────────────────────────────────────

def _run_in_thread(target_fn):
    """Starts target_fn (a Pilot method) on a background thread.
    Refuses to start a second run if one is already active — this is
    the single-session rule from the product decision above."""
    global _worker_thread

    if pilot.status == "running":
        return False

    # FIX: Point to the imported pilot_ui module namespace
    pilot_ui.attach_broadcast_queue(_log_queue)

    def runner():
        try:
            target_fn()
        finally:
            # FIX: Point to the imported pilot_ui module namespace
            pilot_ui.detach_broadcast_queue()

    _worker_thread = threading.Thread(target=runner, daemon=True)
    _worker_thread.start()
    return True


# ──────────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────────

@app.get("/status", response_model=StatusResponse)
def get_status():
    return StatusResponse(
        status=pilot.status,
        error=pilot.error,
        configured=is_configured(),
    )


@app.post("/workflow/start")
def start_workflow():
    if pilot.status == "running":
        return {"started": False, "reason": "A run is already in progress."}

    # FIX: Point to the imported pilot_ui module namespace
    pilot_ui.attach_broadcast_queue(_log_queue)

    def runner():
        try:
            pilot.start_workflow_server_mode()
        finally:
            # FIX: Point to the imported pilot_ui module namespace
            pilot_ui.detach_broadcast_queue()

    global _worker_thread
    _worker_thread = threading.Thread(target=runner, daemon=True)
    _worker_thread.start()
    return {"started": True}


@app.post("/workflow/confirm-login")
def confirm_login():
    """Called by the dashboard once the user has solved the CAPTCHA
    inside the visible Chromium window. Releases the background
    thread that's blocked waiting inside confirm_login() in
    pilot_ui.py — this is the server-mode replacement for the CLI's
    'press Enter' prompt."""
    if pilot_ui._login_event is None:
        return {"confirmed": False, "reason": "No login wait is currently active."}
    pilot_ui._login_event.set()
    return {"confirmed": True}


@app.post("/browser/toggle")
def toggle_browser():
    """Brings the running Chromium window to the front. There is no
    'hide' counterpart by design — Playwright can't reliably minimize
    a window across platforms, and forcing one via OS APIs is exactly
    the fragility we chose to avoid. The user can minimize it
    themselves like any other window; this button just helps them
    find it again."""
    brought_forward = pilot.bring_browser_to_front()
    if not brought_forward:
        return {"toggled": False, "reason": "No browser window is currently open."}
    return {"toggled": True}


@app.post("/notes/start")
def start_notes():
    started = _run_in_thread(pilot.generate_notes)
    if not started:
        return {"started": False, "reason": "A run is already in progress."}
    return {"started": True}


@app.get("/config")
def get_config():
    """Returns saved config WITHOUT secrets — only enough for the GUI
    to know what's already set up, e.g. to prefill a 'logged in as'
    label. Never return groq_api_key or password over this endpoint."""
    if not is_configured():
        return {"configured": False}
    data = load_config()
    return {
        "configured": True,
        "username": data.get("username", ""),
    }


@app.post("/config")
def set_config(payload: OnboardingPayload):
    """Used by the GUI's settings screen in place of the CLI's
    interactive run_onboarding() prompts."""
    save_config({
        "groq_api_key": payload.groq_api_key,
        "username": payload.username,
        "password": payload.password,
        "phone_number": payload.phone_number,
    })
    pilot.load_user_config()
    return {"saved": True}


# ──────────────────────────────────────────────────────────────────
# WebSocket — live log stream
# ──────────────────────────────────────────────────────────────────

@app.websocket("/logs")
async def logs_ws(websocket: WebSocket):
    await websocket.accept()
    _ws_clients.add(websocket)
    try:
        while True:
            # keep the connection open; actual messages are pushed by
            # the queue-pump task below, not read here
            await asyncio.sleep(3600)
    except WebSocketDisconnect:
        pass
    finally:
        _ws_clients.discard(websocket)


async def _pump_log_queue():
    """Runs forever on the event loop. Drains the thread-safe queue
    (filled by Pilot's background thread via the broadcast hook) and
    forwards each entry to every connected WebSocket client."""
    while True:
        try:
            item = _log_queue.get_nowait()
        except queue.Empty:
            await asyncio.sleep(0.1)
            continue

        stale = []
        for ws in _ws_clients:
            try:
                await ws.send_json(item)
            except Exception:
                stale.append(ws)
        for ws in stale:
            _ws_clients.discard(ws)


@app.on_event("startup")
async def _start_pump():
    asyncio.create_task(_pump_log_queue())
