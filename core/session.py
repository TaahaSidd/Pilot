from config import URL, USERNAME, PASSWORD
from pilot_ui import log_info, log_success, log_warning, confirm_login


class Session:
    def __init__(self, page):
        self.page = page

    def is_logged_in(self) -> bool:
        url = self.page.url
        return "/my/" in url.lower() or "dashboard" in url.lower()

    def autofill_credentials(self):
        try:
            self.page.wait_for_selector("input[type='text']", timeout=5000)
            self.page.fill("input[type='text']", USERNAME)
            self.page.fill("input[type='password']", PASSWORD)
            log_success("Credentials filled")
        except Exception as e:
            log_warning(f"Could not autofill credentials: {e}")

    def wait_for_manual_login(self):
        confirm_login()

    def ensure_logged_in(self):
        log_info("Checking session...")

        self.page.goto(URL)
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        if self.is_logged_in():
            log_success("Session alive — skipping login")
            return

        log_info("Not logged in — starting login flow")
        self.autofill_credentials()
        self.wait_for_manual_login()

        if self.is_logged_in():
            log_success("Login successful — session will persist for next run")
        else:
            log_warning("Not on dashboard after login — check manually")
