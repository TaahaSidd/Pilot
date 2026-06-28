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
import ui.pilot_ui as broadcast
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

    broadcast.attach_broadcast_queue(_log_queue)

    def runner():
        try:
            target_fn()
        finally:
            broadcast.detach_broadcast_queue()

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
    started = _run_in_thread(pilot.start_workflow)
    if not started:
        return {"started": False, "reason": "A run is already in progress."}
    return {"started": True}


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
            
@app.post("/workflow/simulate-logs")
def simulate_logs():
    """Simulates a background thread writing to the queue so we can test 
    the WebSocket streaming pipeline without opening a real browser."""
    if pilot.status == "running":
        return {"started": False, "reason": "A run is already in progress."}
        
    broadcast.attach_broadcast_queue(_log_queue)
    pilot.status = "running"

    def dummy_runner():
        try:
            # Simulate a mini multi-pass loop across your Amity courses
            broadcast.log_info("Initializing Mock Pilot Engine...")
            time.sleep(1.5)
            broadcast.log_info("Simulating session authentication success...")
            time.sleep(1.5)
            broadcast.log_info("Processing Course 1: Full Stack Java Development...")
            time.sleep(2.0)
            broadcast.log_success("Successfully extracted notes for Module 1!")
            time.sleep(1.0)
            pilot.status = "done"
        except Exception as e:
            pilot.status = "error"
            pilot.error = str(e)
        finally:
            broadcast.detach_broadcast_queue()

    # Spin it off on the worker thread just like the real workflow
    thread = threading.Thread(target=dummy_runner, daemon=True)
    thread.start()
    return {"started": True, "simulation": "active"}


@app.on_event("startup")
async def _start_pump():
    asyncio.create_task(_pump_log_queue())