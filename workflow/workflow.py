class Workflow:
    def __init__(self, page):
        self.page = page

    # UI cleanup
    def stabilize_page(self):
        print("[PILOT] Cleaning up UI overlays...")

        try:
            self.page.locator("#popupCloseBtn").click(timeout=3000)
            print("[PILOT] Popup closed")
        except:
            print("[PILOT] No popup found")

    # Getting course button
    def get_course_button(self):
        print("[PILOT] Finding courses")

        buttons = self.page.locator("a.view-course-btn")
        count = buttons.count()

        print(f"[PILOT] Found {count} courses")
        return buttons, count

    # Navigating inside course
    def inside_course(self):

        self.page.wait_for_timeout(2500)

        modules = self.page.locator(
            "li.courseindex-item a.courseindex-link[href*='mod/']")
        count = modules.count()

        print(f"[PILOT] Found {count} raw module links")

        for i in range(count):
            try:
                modules = self.page.locator(
                    "li.courseindex-item a.courseindex-link[href*='mod/']")
                link = modules.nth(i)

                title = link.inner_text().strip()
                href = link.get_attribute("href") or ""

                # classify module type
                if "mod/page" in href:
                    mtype = "PAGE"
                elif "mod/quiz" in href:
                    mtype = "QUIZ"
                elif "mod/feedback" in href:
                    mtype = "FEEDBACK"
                else:
                    mtype = "OTHER"

                print(f"[PILOT][MODULE {i+1}/{count}] {title} → {mtype}")

                # skip non-page modules if needed
                if mtype != "PAGE":
                    print(f"[PILOT][SKIP] {mtype} module")
                    continue

                link.click()
                self.page.wait_for_timeout(3000)

                print(f"[PILOT][DONE] Opened → {title}")

            except Exception as e:
                print(f"[PILOT][ERROR] Module {i+1}: {e}")

    # Main workflow
    def start(self):
        print("[PILOT] Workflow started")

        self.stabilize_page()

        buttons, count = self.get_course_button()

        for i in range(count):
            try:
                print(f"\n[PILOT] Opening course {i+1}/{count}")

                self.stabilize_page()

                course_btn = buttons.nth(i)

                course_btn.click()
                self.page.wait_for_timeout(4000)

                course_name = self.page.locator("h1").first
                if course_name.count():
                    print(
                        f"[PILOT] Course → {course_name.inner_text().strip()}")
                else:
                    print("[PILOT] Course → Unknown")

                print("[PILOT] Inside course")

                self.inside_course()

                self.page.go_back()
                self.page.wait_for_timeout(3000)

            except Exception as e:
                print(f"[PILOT][ERROR] Course {i+1}: {e}")
