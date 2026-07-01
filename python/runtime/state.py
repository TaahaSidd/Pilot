from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional


def _now():
    return datetime.now(timezone.utc)


@dataclass
class PilotState:
    """
    Live runtime state.

    This represents what Pilot is doing RIGHT NOW.

    It is NOT persisted.
    Session history is handled separately by HistoryManager.
    """

    # lifecycle
    status: str = "idle"            # idle | running | done | error | stopped
    run_type: Optional[str] = None  # workflow | notes

    # timing
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None

    # progress
    current_course: Optional[str] = None
    current_module: Optional[str] = None
    current_page: Optional[str] = None

    courses_total: int = 0
    courses_completed: int = 0

    modules_total: int = 0
    modules_completed: int = 0

    # stop / abort control
    stop_requested: bool = False

    # login
    awaiting_login: bool = False

    # browser
    browser_open: bool = False

    # errors
    error: Optional[str] = None

    # current activity
    current_action: Optional[str] = None

    def reset(self):
        self.__dict__.update(PilotState().__dict__)

    def start(self, run_type: str):
        self.reset()
        self.status = "running"
        self.run_type = run_type
        self.started_at = _now()

    def finish(self):
        self.status = "done"
        self.finished_at = _now()
        self.stop_requested = False

    def fail(self, error: str):
        self.status = "error"
        self.finished_at = _now()
        self.error = error
        self.stop_requested = False

    def request_stop(self):
        self.stop_requested = True
        self.current_action = "Stopping..."

    def stop(self):
        self.status = "stopped"
        self.finished_at = _now()
        self.awaiting_login = False
        self.browser_open = False
        self.current_action = "Stopped"
        self.stop_requested = False

    def clear_stop(self):
        self.stop_requested = False

    def set_course(self, title: str, current: int, total: int):
        self.current_course = title
        self.courses_total = total
        self.courses_completed = max(0, current - 1)

    def complete_course(self):
        self.courses_completed += 1

    def set_module(self, title: str, current: int, total: int):
        self.current_module = title
        self.modules_total = total
        self.modules_completed = max(0, current - 1)

    def complete_module(self):
        self.modules_completed += 1

    def set_action(self, action: str):
        self.current_action = action

    def set_page(self, title: str):
        self.current_page = title

    def set_login_wait(self, waiting: bool):
        self.awaiting_login = waiting

    def set_browser(self, opened: bool):
        self.browser_open = opened

    def to_dict(self):
        elapsed = None

        if self.started_at:
            end = self.finished_at or _now()
            elapsed = int((end - self.started_at).total_seconds())

        return {
            "status": self.status,
            "run_type": self.run_type,

            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
            "elapsed_seconds": elapsed,

            "current_course": self.current_course,
            "current_module": self.current_module,
            "current_page": self.current_page,

            "courses_total": self.courses_total,
            "courses_completed": self.courses_completed,

            "modules_total": self.modules_total,
            "modules_completed": self.modules_completed,

            "stop_requested": self.stop_requested,

            "awaiting_login": self.awaiting_login,
            "browser_open": self.browser_open,

            "current_action": self.current_action,
            "error": self.error,
        }


state = PilotState()
