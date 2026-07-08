import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Optional


BASE_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "data",
    "sessions",
)
BASE_DIR = os.path.normpath(BASE_DIR)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_read_json(path: str) -> Optional[dict]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


class HistoryManager:
    """
    Stores Pilot run history as local JSON files.

    One run = one session file.

    Works for:
    - workflow runs
    - notes generation runs
    - future run types
    """

    def __init__(self):
        os.makedirs(BASE_DIR, exist_ok=True)
        self.current_session: Optional[dict[str, Any]] = None
        self.current_session_path: Optional[str] = None

    def start_session(self, run_type: str) -> dict:
        session_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"

        session = {
            "id": session_id,
            "type": run_type,  # workflow | notes
            "status": "running",
            "started_at": _now_iso(),
            "finished_at": None,
            "duration_seconds": None,
            "error": None,
            "logs": [],
            "summary": {},
        }

        self.current_session = session
        self.current_session_path = os.path.join(
            BASE_DIR, f"{session_id}.json")
        self._save_current()
        return session

    def append_log(self, level: str, message: Any):
        if not self.current_session:
            return

        self.current_session["logs"].append({
            "timestamp": _now_iso(),
            "level": level,
            "message": message,
        })

        self._save_current()

    def update_summary(self, data: dict):
        if not self.current_session:
            return

        self.current_session["summary"] = {
            **self.current_session.get("summary", {}),
            **data,
        }

        self._save_current()

    def get_latest_courses(self) -> dict:
        sessions = self.list_sessions()

        for session in sessions:
            summary = session.get("summary", {})
            courses = summary.get("courses")

            if isinstance(courses, list) and len(courses) > 0:
                return {
                    "courses": courses,
                    "source_session_id": session.get("id"),
                    "updated_at": session.get("started_at"),
                    "source_type": session.get("type"),
                }

        return {
            "courses": [],
            "source_session_id": None,
            "updated_at": None,
            "source_type": None,
        }

    def increment_summary(self, key: str, amount: int = 1):
        if not self.current_session:
            return

        summary = self.current_session.get("summary", {})
        current = summary.get(key, 0)

        if not isinstance(current, int):
            current = 0

        summary[key] = current + amount
        self.current_session["summary"] = summary

        self._save_current()

    def finish_session(self, status: str = "done", error: Optional[str] = None):
        if not self.current_session:
            return

        finished_at = _now_iso()
        started = datetime.fromisoformat(self.current_session["started_at"])
        finished = datetime.fromisoformat(finished_at)

        self.current_session["status"] = status
        self.current_session["finished_at"] = finished_at
        self.current_session["duration_seconds"] = int(
            (finished - started).total_seconds()
        )
        self.current_session["error"] = error

        self._save_current()

        self.current_session = None
        self.current_session_path = None

    def list_sessions(self) -> list[dict]:
        os.makedirs(BASE_DIR, exist_ok=True)

        sessions = []

        for filename in os.listdir(BASE_DIR):
            if not filename.endswith(".json"):
                continue

            path = os.path.join(BASE_DIR, filename)
            data = _safe_read_json(path)

            if not data:
                continue

            sessions.append({
                "id": data.get("id"),
                "type": data.get("type"),
                "status": data.get("status"),
                "started_at": data.get("started_at"),
                "finished_at": data.get("finished_at"),
                "duration_seconds": data.get("duration_seconds"),
                "error": data.get("error"),
                "summary": data.get("summary", {}),
                "log_count": len(data.get("logs", [])),
            })

        sessions.sort(
            key=lambda s: s.get("started_at") or "",
            reverse=True,
        )

        return sessions

    def get_session(self, session_id: str) -> Optional[dict]:
        path = os.path.join(BASE_DIR, f"{session_id}.json")

        if not os.path.exists(path):
            return None

        return _safe_read_json(path)

    def _save_current(self):
        if not self.current_session or not self.current_session_path:
            return

        with open(self.current_session_path, "w", encoding="utf-8") as f:
            json.dump(self.current_session, f, indent=2, ensure_ascii=False)


history = HistoryManager()
