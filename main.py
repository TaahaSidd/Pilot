from core.browser import Browser
from core.session import Session
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
        while True:
            choice = show_menu()

            if choice == "3":
                log_info("Goodbye!")
                break

            elif choice == "2":
                while True:
                    setting = show_settings_menu(config.AI_PROVIDER)
                    if setting == "1":
                        config.AI_PROVIDER = "groq"
                        log_success("AI Provider set to Groq")
                    elif setting == "2":
                        config.AI_PROVIDER = "gemini"
                        log_success("AI Provider set to Gemini")
                    elif setting == "3":
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
