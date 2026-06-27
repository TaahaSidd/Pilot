import time
import re as re_module
import google.generativeai as genai
from groq import Groq
from config import GEMINI_API_KEY, GROQ_API_KEY, AI_PROVIDER
from ui.pilot_ui import log_info, log_success, log_warning, log_error, log_quiz

# Setup Gemini
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("gemini-2.0-flash")

# Setup Groq
groq_client = Groq(api_key=GROQ_API_KEY)


class QuizSolver:
    def __init__(self, page):
        self.page = page
        self.provider = AI_PROVIDER
        log_info(f"AI Provider: {self.provider.upper()}")

    def solve(self, quiz_url: str, context: str = ""):
        self.page.goto(quiz_url)
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        # Step 1: click Attempt quiz or Continue your attempt
        attempt_btn = self.page.locator(
            "a.btn:has-text('Attempt quiz'), "
            "button.btn:has-text('Attempt quiz'), "
            "a.btn:has-text('Continue your attempt'), "
            "button.btn:has-text('Continue your attempt')"
        )
        if attempt_btn.count() > 0:
            attempt_btn.first.click()
            self.page.wait_for_load_state("domcontentloaded")
            self.page.wait_for_timeout(2000)

            # Handle MA "Start attempt" confirmation modal
            start_btn = self.page.locator("input#id_submitbutton")
            if start_btn.count() > 0:
                start_btn.click()
                self.page.wait_for_load_state("domcontentloaded")
                self.page.wait_for_timeout(2000)
                log_info("Start attempt confirmed")

            log_info("Attempt started")
        else:
            log_warning("No attempt button found — skipping quiz")
            return

        # Step 2: read and answer all questions
        questions = self.page.locator("div.que.multichoice")
        count = questions.count()

        if count == 0:
            log_warning("No questions found — aborting, will not submit")
            return

        log_info(f"Found {count} questions")
        all_answered = True

        for i in range(count):
            try:
                q = questions.nth(i)
                q_text = q.locator("div.qtext").inner_text().strip()

                options = []
                labels = q.locator("div[data-region='answer-label']")
                for j in range(labels.count()):
                    text = labels.nth(j).inner_text().strip()
                    if "\n" in text:
                        text = text.split("\n")[-1].strip()
                    options.append(text)

                if not options:
                    log_warning(f"Q{i+1} has no options — skipping")
                    all_answered = False
                    continue

                answer_index = self._ask_ai(q_text, options, context=context)

                if answer_index is None:
                    log_warning(f"Q{i+1}: AI returned no answer — skipping")
                    all_answered = False
                    continue

                log_quiz(q_text, f"{options[answer_index]}")

                label = q.locator("div[data-region='answer-label']").nth(answer_index)
                label.click()
                self.page.wait_for_timeout(600)

            except Exception as e:
                log_error(f"Q{i+1}: {e}")
                all_answered = False

        # Safety check
        if not all_answered:
            log_warning("Not all questions answered — skipping submission to protect your marks")
            return

        # Step 3: click Finish attempt
        finish_btn = self.page.locator("input#mod_quiz-next-nav")
        if finish_btn.count() == 0:
            log_warning("Finish button not found — not submitting")
            return

        finish_btn.click()
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        # Step 4: verify all answers saved
        not_answered = self.page.locator("td:has-text('Not yet answered')")
        if not_answered.count() > 0:
            log_warning(f"{not_answered.count()} question(s) still unanswered — not submitting")
            return_btn = self.page.locator("button:has-text('Return to attempt')")
            if return_btn.count() > 0:
                return_btn.click()
            return

        # Step 5: click Submit all and finish
        submit_btn = self.page.locator(
            "button:has-text('Submit all and finish'), input[value*='Submit all']")
        if submit_btn.count() == 0:
            log_warning("Submit button not found — not submitting")
            return

        submit_btn.first.click()
        self.page.wait_for_timeout(1500)

        # Step 6: confirm modal
        try:
            self.page.wait_for_selector("button[data-action='save']", timeout=5000)
            self.page.locator("button[data-action='save']").click()
            self.page.wait_for_timeout(2000)
            log_success("Quiz submitted")
        except Exception as e:
            log_warning(f"Modal confirmation failed: {e}")

    def _ask_ai(self, question: str, options: list[str], context: str = "") -> int | None:
        if self.provider == "groq":
            return self._ask_groq(question, options, context)
        else:
            return self._ask_gemini(question, options, context)

    def _build_prompt(self, question: str, options: list[str], context: str = "") -> str:
        options_text = "\n".join([f"{i}. {opt}" for i, opt in enumerate(options)])
        context_block = f"Use this study material as context to answer:\n{context}\n\n" if context else ""
        return f"""You are answering a multiple choice exam question.
        {context_block}Reply with ONLY a single digit — the number of the correct answer (0, 1, 2, or 3).
        Do not explain. Do not write anything else. Just the number.

        Question: {question}

        Options:
        {options_text}

        Answer (single digit only):"""

    def _parse_response(self, raw: str, options: list[str]) -> int | None:
        for char in raw:
            if char.isdigit():
                idx = int(char)
                if 0 <= idx < len(options):
                    return idx
        log_warning(f"Could not parse valid index from: '{raw}'")
        return None

    def _ask_groq(self, question: str, options: list[str], context: str = "") -> int | None:
        prompt = self._build_prompt(question, options, context)
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=10
            )
            raw = response.choices[0].message.content.strip()
            return self._parse_response(raw, options)
        except Exception as e:
            log_error(f"Groq error: {e}")
            return None

    def _ask_gemini(self, question: str, options: list[str], context: str = "") -> int | None:
        prompt = self._build_prompt(question, options, context)
        for attempt in range(3):
            try:
                response = gemini_model.generate_content(prompt)
                raw = response.text.strip()
                return self._parse_response(raw, options)
            except Exception as e:
                error_str = str(e)
                if "429" in error_str:
                    match = re_module.search(r'seconds: (\d+)', error_str)
                    wait = int(match.group(1)) + 5 if match else 60
                    log_warning(f"Rate limited — waiting {wait}s before retry {attempt+1}/3...")
                    time.sleep(wait)
                else:
                    log_error(f"Gemini error: {e}")
                    return None
        log_error("Gemini: all retries exhausted")
        return None