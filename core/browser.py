import os
from playwright.sync_api import sync_playwright
from ui.pilot_ui import log_info


class Browser:
    def __init__(self):
        self.p = sync_playwright().start()

        profile_dir = os.path.join(os.path.dirname(
            os.path.abspath(__file__)), "..", "profile")
        profile_dir = os.path.normpath(profile_dir)

        log_info(f"Using profile: {profile_dir}")

        self.context = self.p.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            headless=False
        )

        self.page = self.context.pages[0] if self.context.pages else self.context.new_page(
        )

    def open(self, url):
        self.page.goto(url)

    def wait(self, ms=1000):
        self.page.wait_for_timeout(ms)

    def close(self):
        self.context.close()
        self.p.stop()
