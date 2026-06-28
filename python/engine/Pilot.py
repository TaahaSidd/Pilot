from core.browser import Browser
from core.session import Session
from core.startup import is_configured, run_onboarding, load_config
from workflow.workflow import Workflow
from ai.notes_engine import NotesEngine
from ui.pilot_ui import (
    display_banner, show_menu, show_settings_menu,
    show_completion_banner, log_info, log_success, log_warning, log_error
)
import config


class Pilot:
    """
    Orchestrates every Pilot action: session creation, workflow runs,
    notes generation, and settings. Used by the CLI (app.py) and the
    background-thread runner inside server.py — same class, same
    methods, no duplicated logic either place.
    """

    def __init__(self):
        self.browser = None
        self.page = None
        self.session = None

        # status tracking — read by server.py's /status endpoint.
        # CLI usage ignores these entirely.
        self.status = "idle"   # idle | running | done | error
        self.error = None

    # ── Lifecycle (CLI) ──────────────────────────────────────────

    def start(self):
        display_banner()
        try:
            self._ensure_configured()
            self._menu_loop()
        except KeyboardInterrupt:
            log_warning("Pilot interrupted by user")
        finally:
            self.close_browser()

    def _ensure_configured(self):
        if not is_configured():
            run_onboarding()
            self.load_user_config()

    def load_user_config(self):
        data = load_config()
        config.GROQ_API_KEY = data["groq_api_key"]
        config.USERNAME = data["username"]
        config.PASSWORD = data["password"]
        config.PHONE_NUMBER = data["phone_number"]

    # ── Session management ───────────────────────────────────────

    def create_session(self):
        self.browser = Browser()
        self.page = self.browser.page
        self.session = Session(self.page)
        self.session.ensure_logged_in()

    def close_browser(self):
        if self.browser:
            try:
                self.browser.close()
                log_info("Browser closed cleanly")
            except Exception:
                pass
            finally:
                self.browser = None
                self.page = None
                self.session = None

    # ── Actions ──────────────────────────────────────────────────
    # These now set self.status, so a server running this on a thread
    # can answer "what's it doing right now" without touching internals.

    def start_workflow(self):
        self.status = "running"
        self.error = None
        try:
            self.create_session()
            Workflow(self.page).start()
            show_completion_banner()
            self.status = "done"
        except Exception as e:
            self.status = "error"
            self.error = str(e)
            log_error(f"Workflow failed: {e}")
        finally:
            self.close_browser()

    def generate_notes(self):
        self.status = "running"
        self.error = None
        try:
            self.create_session()
            NotesEngine(self.page).run()
            self.status = "done"
        except Exception as e:
            self.status = "error"
            self.error = str(e)
            log_error(f"Notes generation failed: {e}")
        finally:
            self.close_browser()

    def settings(self):
        while True:
            choice = show_settings_menu(config.AI_PROVIDER)
            if choice == "1":
                run_onboarding()
                self.load_user_config()
            elif choice == "2":
                break

    def exit(self):
        log_info("Goodbye!")

    # ── CLI menu loop ────────────────────────────────────────────

    def _menu_loop(self):
        actions = {
            "1": self.start_workflow,
            "2": self.generate_notes,
            "3": self.settings,
            "4": self.exit,
        }

        while True:
            choice = show_menu()
            action = actions.get(choice)

            if action is None:
                log_warning("Invalid choice")
                continue

            action()

            if choice == "4":
                break

            if choice in ("1", "2"):
                input("\nPress ENTER to exit...")
                break