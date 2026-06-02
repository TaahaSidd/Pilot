from playwright.sync_api import sync_playwright

class Browser:
    def __init__(self):
        self.p = sync_playwright().start()
        self.browser = self.p.chromium.launch(headless=False)
        self.page = self.browser.new_page()
        
    def open(self,url):
        self.page.goto(url)
        print("Website opened successfully")
            
    def wait(self, ms=1000):
        self.page.wait_for_timeout(ms)
            
    def close(self):
        self.browser.close()
        self.p.stop()
