from core.browser import Browser
from core.session import Session
from workflow.workflow import Workflow


def run():
    print("STARTING PILOT...")

    browser = Browser()
    page = browser.page

    session = Session(page)
    session.ensure_logged_in()

    workflow = Workflow(page)
    workflow.start()

    input("\nPress ENTER to exit Pilot...")
    browser.close()


if __name__ == "__main__":
    run()
