from playwright.sync_api import sync_playwright

class Browser:
    def __init__(self):
        self.p = sync_playwright().start()

        self.context = self.p.chromium.launch_persistent_context(
            user_data_dir="profile",
            headless=False
        )

        self.page = self.context.pages[0] if self.context.pages else self.context.new_page()
        
    def open(self,url):
        self.page.goto(url)
        print("Website opened successfully")
            
    def wait(self, ms=1000):
        self.page.wait_for_timeout(ms)
            
    def close(self):
        self.context.close()
        self.p.stop()
