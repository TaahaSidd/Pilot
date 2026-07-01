from core.browser import Browser
from core.session import Session
from core.startup import is_configured, run_onboarding, load_config
from workflow.workflow import Workflow
from ai.notes_engine import NotesEngine
from ui.pilot_ui import (
    display_banner,
    show_menu,
    show_settings_menu,
    show_completion_banner,
    log_info,
    log_warning,
    log_error,
    prepare_server_login_wait,
    clear_server_login_wait,
)

from runtime.history import history
from runtime.state import state

import config


class Pilot:
    def __init__(self):
        self.browser = None
        self.page = None
        self.session = None

        self.status = "idle"
        self.error = None

    def start(self):
        display_banner()
        try:
            self._ensure_configured()
            self._menu_loop()
        except KeyboardInterrupt:
            log_warning("Pilot interrupted by user")
            self.stop()
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

    def create_session(self):
        self.browser = Browser()
        state.set_browser(True)

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
                state.set_browser(False)

    def bring_browser_to_front(self):
        if self.page:
            self.page.bring_to_front()
            return True
        return False

    def stop(self, force: bool = False):
        """
        Request a safe stop.

        Normal stop:
        - set stop_requested
        - let workflow exit at the next checkpoint
        - browser closes in finally

        Force stop:
        - close browser immediately
        - mark state/history stopped
        """
        log_warning("Stop requested")
        state.request_stop()

        try:
            clear_server_login_wait()
        except Exception:
            pass

        if force:
            log_warning("Force stopping Pilot")
            try:
                self.close_browser()
            except Exception:
                pass

            self.status = "done"
            self.error = None
            state.stop()
            history.finish_session("stopped")

    def start_workflow_server_mode(self):
        login_event = prepare_server_login_wait()

        try:
            self.start_workflow()
        except Exception as e:
            self.error = str(e)
            raise e
        finally:
            clear_server_login_wait()

        return login_event

    def generate_notes(self):
        self.status = "running"
        self.error = None

        state.start("notes")
        history.start_session("notes")

        try:
            self.create_session()

            if state.stop_requested:
                self.stop()
                return

            NotesEngine(self.page).run()

            if state.stop_requested:
                self.stop()
                return

            self.status = "done"
            state.finish()
            history.finish_session("done")

        except Exception as e:
            if state.stop_requested:
                self.stop()
                return

            self.status = "error"
            self.error = str(e)

            state.fail(str(e))
            history.finish_session("error", str(e))

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
