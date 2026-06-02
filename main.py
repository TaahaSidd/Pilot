print("STARTING PILOT...")

from core import login
from core.browser import Browser
from core.login import Login
from config import URL, USERNAME, PASSWORD
from workflow.workflow import Workflow

def run():
    print("RUN FUNCTION ENTERED")

    browser = Browser()
    page = browser.page

    print("Opening site...")
    browser.open(URL)

    login = Login(page)

    # Step 1: Filling Creds
    login.attempt_login(USERNAME, PASSWORD)
    
    #Step 2: wait for manual login
    login.wait_for_manual_login()

    # Step 3: Verify login
    if login.is_logged_in():
        print("[PILOT] Login successful")
    else:
        print("[PILOT] Login not detected")
        
    #Step 4: start workflow
    workflow = Workflow(page)
    workflow.start()
    
    input("\nPress ENTER to exit Pilot...")

    browser.close()


if __name__ == "__main__":
    run()