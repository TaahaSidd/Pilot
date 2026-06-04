from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError
import re
from workflow.quiz_solver import QuizSolver


class Workflow:
    def __init__(self, page: Page):
        self.page = page

    def stabilize_page(self):
        try:
            self.page.locator("#popupCloseBtn").click(timeout=3000)
            print("[PILOT] Popup closed")
        except:
            pass

    def get_course_urls(self) -> list[dict]:
        print("[PILOT] Scanning courses...")
        courses = []

        # Each course card has a unique id like course-info-container-4418-4
        buttons = self.page.locator("a.view-course-btn")
        count = buttons.count()
        print(f"[PILOT] Found {count} courses")

        for i in range(count):
            try:
                btn = buttons.nth(i)
                href = btn.get_attribute("href") or ""
                if not href:
                    continue

                # Walk up to the course card container to read title + completion
                card = btn.locator(
                    "xpath=ancestor::div[contains(@id,'course-info-container')]")

                title = ""
                try:
                    title = card.locator(
                        "h3, h4, .course-title, .card-title").first.inner_text().strip()
                except:
                    title = f"Course {i+1}"

                completion_pct = 0
                try:
                    text = card.inner_text()
                    match = re.search(
                        r'(\d+)%\s*Course Completed', text, re.IGNORECASE)
                    if match:
                        completion_pct = int(match.group(1))
                except:
                    pass

                courses.append({
                    "title": title,
                    "url": href,
                    "completion": completion_pct
                })

                status = "✓ 100%" if completion_pct == 100 else f"{completion_pct}%"
                print(f"[PILOT]   [{status}] {title}")

            except Exception as e:
                print(f"[PILOT][ERROR] Reading course {i+1}: {e}")

        return courses

    def collect_module_urls(self) -> list[dict]:
        self.page.wait_for_timeout(2000)
        modules = []

        # Get all module <li> items that have an <a> with a mod/ href
        items = self.page.locator(
            "li.courseindex-item:has(a.courseindex-link[href*='/mod/'])")
        count = items.count()
        print(f"[PILOT] Found {count} module items")

        for i in range(count):
            try:
                item = items.nth(i)

                # Skip dimmed (locked/restricted) modules
                classes = item.get_attribute("class") or ""
                if "dimmed" in classes:
                    continue

                link = item.locator("a.courseindex-link")
                href = link.get_attribute("href") or ""
                title = link.inner_text().strip()

                if not href:
                    continue

                # Classify type from URL
                if "/mod/page/" in href:
                    mtype = "PAGE"
                elif "/mod/quiz/" in href:
                    mtype = "QUIZ"
                elif "/mod/feedback/" in href:
                    mtype = "FEEDBACK"
                elif "/mod/resource/" in href:
                    mtype = "RESOURCE"
                else:
                    mtype = "OTHER"

                # Check completion from the span class — exact match from HTML
                completion_span = item.locator("span.completioninfo")
                span_class = completion_span.get_attribute("class") or ""
                completed = "completion_complete" in span_class

                modules.append({
                    "url": href,
                    "title": title,
                    "type": mtype,
                    "completed": completed
                })

            except Exception as e:
                print(f"[PILOT][ERROR] Reading module {i+1}: {e}")

        done = sum(1 for m in modules if m["completed"])
        print(f"[PILOT] {done}/{len(modules)} already completed")
        return modules

    def visit_page_module(self, module: dict):
        print(f"[PILOT][PAGE] → {module['title']}")
        self.page.goto(module["url"])
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(3000)
        print(f"[PILOT][PAGE] ✓ done")

    def handle_module(self, module: dict):
        if module["type"] == "PAGE":
            self.visit_page_module(module)
        elif module["type"] == "QUIZ":
            solver = QuizSolver(self.page)
            solver.solve(module["url"])
        else:
            print(f"[PILOT][SKIP] {module['type']} → {module['title']}")

    def process_course(self, course: dict):
        print(
            f"\n[PILOT] ── Course: {course['title']} ({course['completion']}%)")
        self.page.goto(course["url"])
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(3000)
        self.stabilize_page()

        modules = self.collect_module_urls()

        pending = [
            m for m in modules
            if not m["completed"] and m["type"] in ("PAGE", "QUIZ")
        ]

        if not pending:
            print(f"[PILOT] Nothing pending — skipping")
            return

        print(f"[PILOT] {len(pending)} modules to process")

        for i, module in enumerate(pending):
            print(
                f"\n[PILOT] {i+1}/{len(pending)}: [{module['type']}] {module['title']}")
            try:
                self.handle_module(module)
            except PlaywrightTimeoutError:
                print(f"[PILOT][TIMEOUT] {module['title']}")
            except Exception as e:
                print(f"[PILOT][ERROR] {module['title']}: {e}")

    def start(self):
        print("[PILOT] Workflow started")
        self.stabilize_page()

        courses = self.get_course_urls()
        pending = [c for c in courses if c["completion"] < 100]
        skipped = [c for c in courses if c["completion"] == 100]

        print(f"\n[PILOT] {len(skipped)} course(s) complete — skipping")
        print(f"[PILOT] {len(pending)} course(s) to process")

        for course in pending:
            try:
                self.process_course(course)
            except Exception as e:
                print(f"[PILOT][ERROR] Course failed → {course['title']}: {e}")

        print("\n[PILOT] All done.")
