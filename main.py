from core.browser import Browser
from core.session import Session
from core.startup import is_configured, run_onboarding, load_config
from workflow.workflow import Workflow
from ai.notes_engine import NotesEngine
from ui.pilot_ui import (
    display_banner, show_menu, show_settings_menu,
    show_completion_banner, log_info, log_success, log_warning
)
import config


def run():
    display_banner()
    browser = None

    try:
        if not is_configured():
            run_onboarding()
            data = load_config()
            config.GROQ_API_KEY = data["groq_api_key"]
            config.USERNAME = data["username"]
            config.PASSWORD = data["password"]
            config.PHONE_NUMBER = data["phone_number"]

        while True:
            choice = show_menu()

            if choice == "4":
                log_info("Goodbye!")
                break

            elif choice == "3":
                while True:
                    setting = show_settings_menu(config.AI_PROVIDER)
                    if setting == "1":
                        run_onboarding()
                        data = load_config()
                        config.GROQ_API_KEY = data["groq_api_key"]
                        config.USERNAME = data["username"]
                        config.PASSWORD = data["password"]
                        config.PHONE_NUMBER = data["phone_number"]
                    elif setting == "2":
                        break

            elif choice == "1":
                browser = Browser()
                page = browser.page
                session = Session(page)
                session.ensure_logged_in()
                workflow = Workflow(page)
                workflow.start()
                show_completion_banner()
                input("\nPress ENTER to exit...")
                browser.close()
                browser = None
                break

            elif choice == "2":
                browser = Browser()
                page = browser.page
                session = Session(page)
                session.ensure_logged_in()
                notes = NotesEngine(page)
                notes.run()
                input("\nPress ENTER to exit...")
                browser.close()
                browser = None
                break

    except KeyboardInterrupt:
        log_warning("Pilot interrupted by user")

    finally:
        if browser:
            try:
                browser.close()
                log_info("Browser closed cleanly")
            except:
                pass


if __name__ == "__main__":
    run()