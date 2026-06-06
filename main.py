from core.browser import Browser
from core.session import Session
from core.setup import is_configured, run_onboarding, load_config
from workflow.workflow import Workflow
from pilot_ui import (
    display_banner, show_menu, show_settings_menu,
    show_completion_banner, log_info, log_success, log_warning
)
import config


def run():
    display_banner()
    browser = None

    try:
        # First time setup
        if not is_configured():
            run_onboarding()
            # Reload config after setup
            data = load_config()
            config.GROQ_API_KEY = data["groq_api_key"]
            config.USERNAME = data["username"]
            config.PASSWORD = data["password"]

        while True:
            choice = show_menu()

            if choice == "3":
                log_info("Goodbye!")
                break

            elif choice == "2":
                while True:
                    setting = show_settings_menu(config.AI_PROVIDER)
                    if setting == "1":
                        run_onboarding()
                        data = load_config()
                        config.GROQ_API_KEY = data["groq_api_key"]
                        config.USERNAME = data["username"]
                        config.PASSWORD = data["password"]
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
