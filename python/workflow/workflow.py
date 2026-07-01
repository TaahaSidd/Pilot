from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError
import re

from ai.quiz_solver import QuizSolver
from ai.feedback_solver import FeedbackSolver
from runtime.state import state
from ui.pilot_ui import (
    log_info,
    log_success,
    log_warning,
    log_error,
    log_page,
    log_skip,
    log_course,
    log_module_progress,
    show_course_summary,
)


class Workflow:
    def __init__(self, page: Page):
        self.page = page
        self.last_page_content = ""

    def _should_stop(self) -> bool:
        if state.stop_requested:
            log_warning("Workflow stopped by user")
            return True
        return False

    def stabilize_page(self):
        if self._should_stop():
            return

        try:
            self.page.locator("#popupCloseBtn").click(timeout=3000)
        except:
            pass

    def get_course_urls(self) -> list[dict]:
        if self._should_stop():
            return []

        log_info("Scanning courses...")
        courses = []

        buttons = self.page.locator("a.view-course-btn")
        count = buttons.count()
        log_info(f"Found {count} courses")

        for i in range(count):
            if self._should_stop():
                return courses

            try:
                btn = buttons.nth(i)
                href = btn.get_attribute("href") or ""
                if not href:
                    continue

                course_id = href.rstrip("/").split("=")[-1]

                title = f"Course {course_id}"

                try:
                    card = self.page.locator(
                        f"[id*='course-info-container-{course_id}']"
                    )
                    if card.count() > 0:
                        heading = card.locator(
                            "h3, h4, strong, .card-title, [class*='title']"
                        ).first
                        if heading.count() > 0:
                            title = heading.inner_text().strip()
                except:
                    pass

                completion_pct = 0

                try:
                    card = self.page.locator(
                        f"[id*='course-info-container-{course_id}']"
                    )
                    if card.count() > 0:
                        text = card.inner_text()
                        match = re.search(
                            r"(\d+)%\s*Course Completed",
                            text,
                            re.IGNORECASE,
                        )
                        if match:
                            completion_pct = int(match.group(1))
                except:
                    pass

                courses.append({
                    "title": title,
                    "url": href,
                    "completion": completion_pct,
                })

            except Exception as e:
                if self._should_stop():
                    return courses
                log_error(f"Reading course {i + 1}: {e}")

        return courses

    def collect_module_urls(self) -> list[dict]:
        if self._should_stop():
            return []

        self.page.wait_for_timeout(2000)
        modules = []

        if self._should_stop():
            return modules

        items = self.page.locator(
            "li.courseindex-item:has(a.courseindex-link[href*='/mod/'])"
        )
        count = items.count()

        for i in range(count):
            if self._should_stop():
                return modules

            try:
                item = items.nth(i)

                link = item.locator("a.courseindex-link")
                href = link.get_attribute("href") or ""
                title = link.inner_text().strip()

                if not href:
                    continue

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

                classes = item.get_attribute("class") or ""
                if "dimmed" in classes and mtype not in ("QUIZ", "FEEDBACK"):
                    continue

                completion_span = item.locator("span.completioninfo")
                span_class = completion_span.get_attribute("class") or ""
                completed = "completion_complete" in span_class

                modules.append({
                    "url": href,
                    "title": title,
                    "type": mtype,
                    "completed": completed,
                })

            except Exception as e:
                if self._should_stop():
                    return modules
                log_error(f"Reading module {i + 1}: {e}")

        done = sum(1 for m in modules if m["completed"])
        log_info(f"{done}/{len(modules)} modules already completed")
        return modules

    def visit_page_module(self, module: dict):
        if self._should_stop():
            return

        log_page(module["title"])

        if self._should_stop():
            return

        self.page.goto(module["url"])
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(3000)

        if self._should_stop():
            return

        try:
            content = self.page.locator("div[role='main']").first.inner_text()
            self.last_page_content = content[:3000]
        except:
            self.last_page_content = ""

    def handle_module(self, module: dict):
        if self._should_stop():
            return

        if module["type"] == "PAGE":
            self.visit_page_module(module)
        elif module["type"] == "QUIZ":
            solver = QuizSolver(self.page)
            solver.solve(module["url"], context=self.last_page_content)
        elif module["type"] == "FEEDBACK":
            solver = FeedbackSolver(self.page)
            solver.solve(module["url"])
        else:
            log_skip(f"{module['type']} → {module['title']}")

    def process_course(self, course: dict):
        if self._should_stop():
            return

        self.page.goto(course["url"])
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(3000)

        if self._should_stop():
            return

        self.stabilize_page()

        max_passes = 10
        passes = 0
        last_pending_count = -1

        while passes < max_passes:
            if self._should_stop():
                return

            passes += 1

            self.page.goto(course["url"])
            self.page.wait_for_load_state("domcontentloaded")
            self.page.wait_for_timeout(2000)

            if self._should_stop():
                return

            modules = self.collect_module_urls()

            if self._should_stop():
                return

            pending = [
                m for m in modules
                if not m["completed"] and m["type"] in ("PAGE", "QUIZ", "FEEDBACK")
            ]

            if not pending:
                log_success("Course complete — nothing pending")
                return

            if len(pending) == last_pending_count:
                log_info("No new modules unlocked — moving to next course")
                return

            last_pending_count = len(pending)
            log_info(f"Pass {passes}: {len(pending)} modules to process")

            for i, module in enumerate(pending):
                if self._should_stop():
                    return

                log_module_progress(
                    i + 1,
                    len(pending),
                    module["type"],
                    module["title"],
                )

                if self._should_stop():
                    return

                try:
                    self.handle_module(module)
                except PlaywrightTimeoutError:
                    if self._should_stop():
                        return
                    log_warning(f"Timeout → {module['title']}")
                except Exception as e:
                    if self._should_stop():
                        return
                    log_error(f"{module['title']}: {e}")

            log_info(
                f"Pass {passes} complete — rescanning for newly unlocked modules..."
            )

    def start(self):
        log_info("Workflow started")

        if self._should_stop():
            return

        self.stabilize_page()

        if self._should_stop():
            return

        courses = self.get_course_urls()

        if self._should_stop():
            return

        pending = [c for c in courses if c["completion"] < 100]
        skipped = [c for c in courses if c["completion"] == 100]

        show_course_summary(courses)

        if self._should_stop():
            return

        log_info(f"{len(skipped)} course(s) already complete — skipping")
        log_info(f"{len(pending)} course(s) to process")

        for idx, course in enumerate(pending):
            if self._should_stop():
                return

            log_course(
                course["title"],
                course["completion"],
                idx + 1,
                len(pending),
            )

            if self._should_stop():
                return

            try:
                self.process_course(course)
            except Exception as e:
                if self._should_stop():
                    return
                log_error(f"Course failed → {course['title']}: {e}")
