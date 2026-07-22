from config import PASSWORD, URL, USERNAME
from runtime.state import state
from ui.pilot_ui import confirm_login, log_info, log_success, log_warning


class Session:
    def __init__(self, page):
        self.page = page

    def is_login_page(self) -> bool:
        try:
            url = self.page.url.lower()
            if "/login/" in url or "login/index.php" in url:
                return True
        except Exception:
            pass

        for selector in (
            "form#login",
            "input#username",
            "input#password",
            "button#loginbtn",
            ".loginform",
        ):
            try:
                locator = self.page.locator(selector).first
                if locator.count() > 0 and locator.is_visible(timeout=1000):
                    return True
            except Exception:
                pass

        return False

    def is_logged_in(self) -> bool:
        if self.is_login_page():
            return False

        try:
            url = self.page.url.lower()
            if "/my/" in url or "dashboard" in url:
                return True
        except Exception:
            pass

        for selector in (
            "a[href*='/course/view.php']",
            ".dashboard-card",
            ".coursebox",
            "[data-course-id]",
            "#page-my-index",
        ):
            try:
                locator = self.page.locator(selector).first
                if locator.count() > 0 and locator.is_visible(timeout=1000):
                    return True
            except Exception:
                pass

        return False

    def autofill_credentials(self):
        try:
            self.page.wait_for_selector("#username, input[name='username']", timeout=5000)
            self.page.fill("#username, input[name='username']", USERNAME)
            self.page.fill("#password, input[name='password']", PASSWORD)
            log_success("Credentials filled")
        except Exception as e:
            log_warning(f"Could not autofill credentials: {e}")

    def has_login_challenge(self) -> bool:
        challenge_selectors = [
            "#recaptcha_element",
            ".g-recaptcha",
            "[data-sitekey]",
            "iframe[src*='recaptcha']",
            "iframe[title*='reCAPTCHA']",
            "iframe[src*='hcaptcha']",
            "iframe[title*='hCaptcha']",
            "input[name='captcha']",
            "input[id*='captcha']",
            "img[src*='captcha']",
        ]

        for selector in challenge_selectors:
            try:
                if self.page.locator(selector).count() > 0:
                    return True
            except Exception:
                pass

        try:
            body_text = self.page.locator("body").inner_text(timeout=2000).lower()
            challenge_words = (
                "captcha",
                "i'm not a robot",
                "i am not a robot",
                "verify you are human",
                "security check",
            )
            if any(word in body_text for word in challenge_words):
                return True
        except Exception:
            pass

        try:
            return any(
                "recaptcha" in frame.url.lower() or "hcaptcha" in frame.url.lower()
                for frame in self.page.frames
            )
        except Exception:
            return False

    def submit_login_form(self) -> bool:
        try:
            button = self.page.locator(
                "#loginbtn, form#login button[type='submit'], form#login input[type='submit']"
            ).first
            button.click(timeout=5000)
            self.page.wait_for_load_state("domcontentloaded")
            self.page.wait_for_timeout(3000)
            return True
        except Exception as e:
            log_warning(f"Could not submit login form: {e}")
            return False

    def wait_for_manual_login(self):
        confirm_login()
        if state.stop_requested:
            return

        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(3000)

        if self.is_login_page():
            self.page.goto(URL + "/my/")
            self.page.wait_for_load_state("domcontentloaded")
            self.page.wait_for_timeout(3000)

    def ensure_logged_in(self):
        log_info("Checking session...")

        self.page.goto(URL)
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        if self.is_logged_in():
            log_success("Session alive - skipping login")
            return

        log_info("Not logged in - starting login flow")
        self.autofill_credentials()

        if self.has_login_challenge():
            log_warning("Login verification required")
            self.wait_for_manual_login()
        else:
            self.submit_login_form()
            if not self.is_logged_in() and self.has_login_challenge():
                log_warning("Login verification required")
                self.wait_for_manual_login()

        if state.stop_requested:
            return

        if self.is_logged_in():
            log_success("Login successful - session will persist for next run")
            return

        log_warning("Forcing navigation to dashboard...")
        self.page.goto(URL + "/my/")
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(3000)

        if self.is_logged_in():
            log_success("Now on dashboard")
            return

        raise RuntimeError(
            "Login was not completed. Check your Amity details and try again."
        )
