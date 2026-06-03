from core import login
from core.browser import Browser
from core.login import Login
from config import URL, USERNAME, PASSWORD
from workflow.workflow import Workflow
from core.session import Session


def run():
    print("STARTING PILOT...")

    browser = Browser()
    page = browser.page

    browser.open(URL)

    session = Session(page)

    session.wait_for_ready()

    if session.is_ready():
        print("[PILOT] Session is ready.")
    else:
        print("[PILOT] Session uncertain.")

    workflow = Workflow(page)
    workflow.start()

    input("\nPress ENTER to exit Pilot...")

    browser.close()


if __name__ == "__main__":
    run()
