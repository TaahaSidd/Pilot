from pilot_ui import log_info, log_success, log_warning, log_error


class FeedbackSolver:
    def __init__(self, page):
        self.page = page

    def solve(self, feedback_url: str):
        log_info(f"Opening feedback → {feedback_url}")
        self.page.goto(feedback_url)
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        # Click "Answer the questions" button if on intro page
        answer_btn = self.page.locator(
            "a.btn:has-text('Answer the questions')")
        if answer_btn.count() > 0:
            answer_btn.first.click()
            self.page.wait_for_load_state("domcontentloaded")
            self.page.wait_for_timeout(2000)
            log_info("Feedback form opened")
        else:
            log_info("Already on feedback form")

        # Check if already submitted
        already_done = self.page.locator(
            "div:has-text('Your response has been saved')")
        if already_done.count() > 0:
            log_success("Feedback already submitted — skipping")
            return

        # Handle Country dropdown if present (select India)
        country_select = self.page.locator(
            "select[name^='multichoice_']").first
        if country_select.count() > 0:
            # Check if it's actually a country dropdown by looking for India option
            india_option = country_select.locator("option[value='78']")
            if india_option.count() > 0:
                country_select.select_option(value="78")  # India
                log_info("Country set to India")
                self.page.wait_for_timeout(300)

        # Handle all radio groups (scale 1-10) — select 9
        question_groups = self.page.locator(
            "div[data-groupname^='group_multichoice_']")
        count = question_groups.count()

        if count > 0:
            log_info(f"Found {count} rating questions — selecting 9 for all")
            for i in range(count):
                try:
                    group = question_groups.nth(i)
                    label = group.locator("label:has(input[value='9'])")
                    label.click()
                    self.page.wait_for_timeout(300)
                except Exception as e:
                    log_error(f"Rating question {i+1}: {e}")

        # Handle text areas if present
        like_textarea = self.page.locator("textarea[name^='textarea_']").first
        if like_textarea.count() > 0:
            textareas = self.page.locator("textarea[name^='textarea_']")
            textarea_count = textareas.count()
            log_info(
                f"Found {textarea_count} text field(s) — filling with default responses")

            responses = [
                "The course content was well structured and easy to understand. The learning material was comprehensive and helpful.",
                "Nothing significant. The course was overall satisfactory and met my learning expectations."
            ]

            for i in range(textarea_count):
                try:
                    text = responses[i] if i < len(
                        responses) else "Good course overall."
                    textareas.nth(i).fill(text)
                    self.page.wait_for_timeout(300)
                except Exception as e:
                    log_error(f"Textarea {i+1}: {e}")

        # Submit
        submit_btn = self.page.locator("input#id_savevalues")
        if submit_btn.count() == 0:
            log_warning("Submit button not found — not submitting")
            return

        submit_btn.click()
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)
        log_success("Feedback submitted")
