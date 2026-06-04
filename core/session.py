from config import URL, USERNAME, PASSWORD


class Session:
    def __init__(self, page):
        self.page = page

    def is_logged_in(self) -> bool:
        """Check current URL — if we're on the dashboard, session is alive."""
        url = self.page.url
        print(f"[PILOT] Current URL: {url}")
        return "/my/" in url.lower() or "dashboard" in url.lower()

    def autofill_credentials(self):
        """Fill in username and password — user still needs to solve CAPTCHA."""
        try:
            self.page.wait_for_selector("input[type='text']", timeout=5000)
            self.page.fill("input[type='text']", USERNAME)
            self.page.fill("input[type='password']", PASSWORD)
            print("[PILOT] Credentials filled")
        except Exception as e:
            print(f"[PILOT] Could not autofill credentials: {e}")

    def wait_for_manual_login(self):
        """Pause and let user solve CAPTCHA and complete login."""
        print("\n[PILOT] Manual login required")
        print("[PILOT] Credentials have been filled in for you")
        print("[PILOT] Please solve the CAPTCHA and click Login in the browser")
        input("\n[PILOT] Press ENTER once you are on the dashboard...")

    def ensure_logged_in(self):
        """
        Main entry point. If session is alive, skip login entirely.
        If not, autofill + wait for manual CAPTCHA solve.
        """
        print("[PILOT] Checking session...")

        # Navigate to the site first
        self.page.goto(URL)
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        if self.is_logged_in():
            print("[PILOT] Session alive — skipping login")
            return

        print("[PILOT] Not logged in — starting login flow")
        self.autofill_credentials()
        self.wait_for_manual_login()

        if self.is_logged_in():
            print("[PILOT] Login successful — session will persist for next run")
        else:
            print("[PILOT] Warning: not on dashboard after login — check manually")
