from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional


def _now():
    return datetime.now(timezone.utc)


# ──────────────────────────────────────────────────────────────────
# Runtime action codes
# Stable machine-readable values for frontend icons/colors/logic.
# ──────────────────────────────────────────────────────────────────

ACTION_IDLE = "idle"
ACTION_LAUNCHING_BROWSER = "launching_browser"
ACTION_CHECKING_SESSION = "checking_session"
ACTION_WAITING_LOGIN = "waiting_login"
ACTION_LOGIN_CONFIRMED = "login_confirmed"
ACTION_SCANNING_COURSES = "scanning_courses"
ACTION_OPENING_COURSE = "opening_course"
ACTION_SCANNING_MODULES = "scanning_modules"
ACTION_PROCESSING_MODULE = "processing_module"
ACTION_READING_PAGE = "reading_page"
ACTION_PROCESSING_QUIZ = "processing_quiz"
ACTION_PROCESSING_FEEDBACK = "processing_feedback"
ACTION_GENERATING_NOTES = "generating_notes"
ACTION_SAVING_NOTES = "saving_notes"
ACTION_CLOSING_BROWSER = "closing_browser"
ACTION_STOPPING = "stopping"
ACTION_STOPPED = "stopped"
ACTION_DONE = "done"
ACTION_ERROR = "error"


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

    # course progress
    current_course: Optional[str] = None
    course_progress_percent: int = 0

    courses_total: int = 0
    courses_completed: int = 0

    # module progress
    current_module: Optional[str] = None
    current_module_type: Optional[str] = None
    current_page: Optional[str] = None

    modules_total: int = 0
    modules_completed: int = 0
    modules_processed: int = 0
    module_current_index: int = 0

    # stop / abort control
    stop_requested: bool = False

    # login
    awaiting_login: bool = False

    # browser
    browser_open: bool = False

    # errors
    error: Optional[str] = None

    # current activity
    current_action: str = ACTION_IDLE
    current_action_label: Optional[str] = None

    def reset(self):
        self.__dict__.update(PilotState().__dict__)

    def start(self, run_type: str):
        self.reset()
        self.status = "running"
        self.run_type = run_type
        self.started_at = _now()
        self.set_action(ACTION_IDLE, "Starting Pilot")

    def finish(self):
        self.status = "done"
        self.finished_at = _now()
        self.stop_requested = False
        self.set_action(ACTION_DONE, "Done")

    def fail(self, error: str):
        self.status = "error"
        self.finished_at = _now()
        self.error = error
        self.stop_requested = False
        self.set_action(ACTION_ERROR, error)

    def request_stop(self):
        self.stop_requested = True
        self.set_action(ACTION_STOPPING, "Stopping...")

    def stop(self):
        self.status = "stopped"
        self.finished_at = _now()
        self.awaiting_login = False
        self.browser_open = False
        self.stop_requested = False
        self.set_action(ACTION_STOPPED, "Stopped")

    def clear_stop(self):
        self.stop_requested = False

    def set_course(
        self,
        title: str,
        current: int,
        total: int,
        completion: int = 0,
    ):
        self.current_course = title
        self.course_progress_percent = completion
        self.courses_total = total
        self.courses_completed = max(0, current - 1)

    def complete_course(self):
        self.courses_completed = min(
            self.courses_total,
            self.courses_completed + 1,
        )

    def set_module(
        self,
        title: str,
        current: int,
        total: int,
        mtype: Optional[str] = None,
    ):
        self.current_module = title
        self.current_module_type = mtype
        self.module_current_index = current
        self.modules_total = total
        self.error = None

        processed = max(0, current - 1)
        self.modules_processed = processed
        self.modules_completed = processed

    def mark_module_processed(self):
        self.modules_processed = min(
            self.modules_total,
            self.modules_processed + 1,
        )
        self.modules_completed = self.modules_processed

    def complete_module(self):
        self.mark_module_processed()

    def set_action(self, action: str, label: Optional[str] = None):
        self.current_action = action
        self.current_action_label = label

    def set_page(self, title: str):
        self.current_page = title

    def set_login_wait(self, waiting: bool):
        self.awaiting_login = waiting

        if waiting:
            self.set_action(
                ACTION_WAITING_LOGIN,
                "Waiting for manual login confirmation",
            )

    def set_browser(self, opened: bool):
        self.browser_open = opened

        if opened:
            self.set_action(ACTION_LAUNCHING_BROWSER, "Browser opened")
        elif self.status not in ("stopped", "error"):
            self.set_action(ACTION_CLOSING_BROWSER, "Browser closed")

    def to_dict(self):
        elapsed = None

        if self.started_at:
            end = self.finished_at or _now()
            elapsed = int((end - self.started_at).total_seconds())

        module_progress_percent = (
            int((self.modules_processed / self.modules_total) * 100)
            if self.modules_total
            else 0
        )

        course_run_progress_percent = (
            int((self.courses_completed / self.courses_total) * 100)
            if self.courses_total
            else 0
        )

        return {
            "status": self.status,
            "run_type": self.run_type,

            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
            "elapsed_seconds": elapsed,

            "current_course": self.current_course,
            "course_progress_percent": self.course_progress_percent,
            "course_run_progress_percent": course_run_progress_percent,

            "courses_total": self.courses_total,
            "courses_completed": self.courses_completed,

            "current_module": self.current_module,
            "current_module_type": self.current_module_type,
            "current_page": self.current_page,

            "modules_total": self.modules_total,
            "modules_completed": self.modules_completed,
            "modules_processed": self.modules_processed,
            "module_current_index": self.module_current_index,
            "module_progress_percent": module_progress_percent,

            "stop_requested": self.stop_requested,

            "awaiting_login": self.awaiting_login,
            "browser_open": self.browser_open,

            "current_action": self.current_action,
            "current_action_label": self.current_action_label,

            "error": self.error,
        }
        
state = PilotState()
