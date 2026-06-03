class Session:
    def __init__(self, page):
        self.page = page

    def wait_for_ready(self):
        print("\n[PILOT] Waiting for you to complete login...")

        input(
            "[PILOT] Login in browser (if needed), reach dashboard, then press ENTER..."
        )

    def is_ready(self):
        url = self.page.url
        print(f"[PILOT] Current URL: {url}")

        return "/my/" in url.lower()
