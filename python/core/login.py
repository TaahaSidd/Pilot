from python.config import USERNAME, PASSWORD

class Login:
    def __init__(self,page):
        self.page = page
        
    def attempt_login(self, USERNAME, PASSWORD):
        print("Attempting to login...")
        
        try:
            #username
            self.page.fill("input[type='text']", USERNAME)

            #password
            self.page.fill("input[type='password']",PASSWORD)
            
            print("Filled in cred")
            print("Waiting for user....")
            
        except Exception as e:
            print("Login attempt failed", e)
            
            
    def wait_for_manual_login(self):
        print("\n[PILOT] Manual Login Required")
        print("[PILOT] Solve CAPTCHA / complete login in browser")
        
        input("\n[PILOt] Press Press ENTER after successful login...")

    def detect_captcha(self):
        print("Checking for captcha...")
        
        captcha = self.page.query_selector("#recaptcha_element")
        
        if captcha:
            print("CAPTCHA detected")
            return True
        
        return False
    
    def wait_for_manual_login(self):
        print("\n[PILOT] Manual login required")
        print("[PILOT] Complete CAPTCHA and login in the browser")

        input("\n[PILOT] Press ENTER after you are successfully logged in...")
    
    def is_logged_in(self):
        current_url = self.page.url
        
        print(f"[PILOT] Current URL: {current_url}")
        
        return "login" not in current_url.lower()