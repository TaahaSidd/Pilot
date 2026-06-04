import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash-latest")


class QuizSolver:
    def __init__(self, page):
        self.page = page

    def solve(self, quiz_url: str):
        print(f"[QUIZ] Opening → {quiz_url}")
        self.page.goto(quiz_url)
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        # Step 1: click Attempt quiz
        attempt_btn = self.page.locator(
            "button.btn:has-text('Attempt quiz'), a.btn:has-text('Attempt quiz')")
        if attempt_btn.count() > 0:
            attempt_btn.first.click()
            self.page.wait_for_load_state("domcontentloaded")
            self.page.wait_for_timeout(2000)
            print("[QUIZ] Attempt started")
        else:
            print("[QUIZ] No attempt button — may already be in progress")

        # Step 2: read and answer all questions
        questions = self.page.locator("div.que.multichoice")
        count = questions.count()
        print(f"[QUIZ] Found {count} questions")

        if count == 0:
            print("[QUIZ] No questions found — aborting, will not submit")
            return

        all_answered = True

        for i in range(count):
            try:
                q = questions.nth(i)

                # Get question text
                q_text = q.locator("div.qtext").inner_text().strip()

                # Get answer options — clean up "a.\n\nSome text" → "Some text"
                options = []
                labels = q.locator("div[data-region='answer-label']")
                for j in range(labels.count()):
                    text = labels.nth(j).inner_text().strip()
                    if "\n" in text:
                        text = text.split("\n")[-1].strip()
                    options.append(text)

                if not options:
                    print(f"[QUIZ][SKIP] Q{i+1} has no options — skipping")
                    all_answered = False
                    continue

                print(f"[QUIZ] Q{i+1}: {q_text}")
                print(f"[QUIZ] Options: {options}")

                # Ask Gemini
                answer_index = self._ask_gemini(q_text, options)

                if answer_index is None:
                    print(
                        f"[QUIZ][WARN] Q{i+1}: Gemini returned no answer — skipping this question")
                    all_answered = False
                    continue

                print(
                    f"[QUIZ] Gemini chose {answer_index} → {options[answer_index]}")

                # Click the label (not the hidden radio input)
                label = q.locator(
                    "div[data-region='answer-label']").nth(answer_index)
                label.click()
                self.page.wait_for_timeout(600)

            except Exception as e:
                print(f"[QUIZ][ERROR] Q{i+1}: {e}")
                all_answered = False

        # Safety check — only submit if all questions were answered
        if not all_answered:
            print(
                "[QUIZ][ABORT] Not all questions answered — skipping submission to protect your marks")
            return

        # Step 3: click Finish attempt
        finish_btn = self.page.locator("input#mod_quiz-next-nav")
        if finish_btn.count() == 0:
            print("[QUIZ][ABORT] Finish button not found — not submitting")
            return

        finish_btn.click()
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)
        print("[QUIZ] Finish attempt clicked")

        # Step 4: verify all answers saved before submitting
        not_answered = self.page.locator("td:has-text('Not yet answered')")
        if not_answered.count() > 0:
            print(
                f"[QUIZ][ABORT] {not_answered.count()} question(s) still unanswered on summary — not submitting")
            # Go back and try again
            return_btn = self.page.locator(
                "button:has-text('Return to attempt')")
            if return_btn.count() > 0:
                return_btn.click()
            return

        # Step 5: click Submit all and finish
        submit_btn = self.page.locator(
            "button:has-text('Submit all and finish'), input[value*='Submit all']")
        if submit_btn.count() == 0:
            print("[QUIZ][ABORT] Submit button not found — not submitting")
            return

        submit_btn.first.click()
        self.page.wait_for_timeout(1500)
        print("[QUIZ] Submit clicked")

        # Step 6: confirm modal
        confirm_btn = self.page.locator(
            "button:has-text('Submit all and finish')")
        if confirm_btn.count() > 0:
            confirm_btn.first.click()
            self.page.wait_for_timeout(2000)
            print("[QUIZ] Confirmed — quiz submitted")
        else:
            print("[QUIZ][WARN] Confirmation modal not found")

    def _ask_gemini(self, question: str, options: list[str]) -> int | None:
        """
        Ask Gemini for the correct answer index.
        Returns index (0-based) or None if it fails.
        """
        options_text = "\n".join(
            [f"{i}. {opt}" for i, opt in enumerate(options)])

        prompt = f"""You are answering a multiple choice exam question.
                    Reply with ONLY a single digit — the number of the correct answer (0, 1, 2, or 3).
                    Do not explain. Do not write anything else. Just the number.

                    Question: {question}

                    Options:
                    {options_text}

                    Answer (single digit only):"""

        try:
            response = model.generate_content(prompt)
            raw = response.text.strip()
            print(f"[QUIZ][GEMINI] Raw response: '{raw}'")

            for char in raw:
                if char.isdigit():
                    idx = int(char)
                    if 0 <= idx < len(options):
                        return idx

            print(
                f"[QUIZ][GEMINI] Could not parse a valid index from: '{raw}'")
            return None

        except Exception as e:
            print(f"[QUIZ][GEMINI ERROR] {e}")
            return None
