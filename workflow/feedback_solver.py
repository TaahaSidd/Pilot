from pilot_ui import log_info, log_success, log_warning, log_error
import config


class FeedbackSolver:
    def __init__(self, page):
        self.page = page

    def solve(self, feedback_url: str):
        log_info(f"Opening feedback → {feedback_url}")
        self.page.goto(feedback_url)
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        answer_btn = self.page.locator("a.btn:has-text('Answer the questions')")
        if answer_btn.count() > 0:
            answer_btn.first.click()
            self.page.wait_for_load_state("domcontentloaded")
            self.page.wait_for_timeout(2000)
            log_info("Feedback form opened")
        else:
            log_info("Already on feedback form")

        already_done = self.page.locator("div:has-text('Your response has been saved')")
        if already_done.count() > 0:
            log_success("Feedback already submitted — skipping")
            return

        # 1. Country dropdown (skip if no India option — different forms vary)
        self._handle_country_dropdown()

        # 2. All other dropdowns (select first real option)
        self._handle_generic_dropdowns()

        # 3. All radio button groups — pick the highest positive option
        self._handle_radio_groups()

        # 4. Checkboxes — select the first one in each group
        self._handle_checkboxes()

        # 5. Text inputs (single-line) — fill with sensible defaults
        self._handle_text_inputs()

        # 6. Text areas (multi-line) — fill with sensible defaults
        self._handle_textareas()

        # Submit
        submit_btn = self.page.locator("input#id_savevalues")
        if submit_btn.count() == 0:
            log_warning("Submit button not found — not submitting")
            return

        submit_btn.click()
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)
        log_success("Feedback submitted")

    def _handle_country_dropdown(self):
        country_select = self.page.locator("select[name^='multichoice_']").first
        if country_select.count() > 0:
            india_option = country_select.locator("option[value='78']")
            if india_option.count() > 0:
                country_select.select_option(value="78")
                log_info("Country set to India")
                self.page.wait_for_timeout(300)

    def _handle_generic_dropdowns(self):
        """Handle non-country dropdowns — select first real (non-empty) option."""
        selects = self.page.locator("select[name^='multichoice_']")
        count = selects.count()
        for i in range(count):
            try:
                select = selects.nth(i)
                # Skip if already handled (country) — check if it has India
                if select.locator("option[value='78']").count() > 0:
                    continue
                options = select.locator("option")
                opt_count = options.count()
                # Pick first option with a real value (skip empty "0" placeholder)
                for j in range(opt_count):
                    val = options.nth(j).get_attribute("value")
                    if val and val != "0":
                        select.select_option(value=val)
                        log_info(f"Dropdown {i+1}: selected option")
                        self.page.wait_for_timeout(300)
                        break
            except Exception as e:
                log_error(f"Dropdown {i+1}: {e}")

    def _handle_radio_groups(self):
        """For each radio group, pick the best positive answer (last non-'not selected' option, or highest numeric)."""
        groups = self.page.locator("div[data-groupname^='group_multichoice_']")
        count = groups.count()
        log_info(f"Found {count} radio groups")

        for i in range(count):
            try:
                group = groups.nth(i)
                labels = group.locator("label.form-check-label")
                label_count = labels.count()

                if label_count == 0:
                    continue

                # Try to find the highest-value radio (excluding "Not selected" / value 0)
                best_label = None
                best_value = -1

                for j in range(label_count):
                    label = labels.nth(j)
                    radio = label.locator("input[type='radio']")
                    if radio.count() == 0:
                        continue
                    val = radio.get_attribute("value")
                    text = label.inner_text().strip().lower()

                    if val is None or val == "0" or "not selected" in text:
                        continue

                    try:
                        num_val = int(val)
                    except:
                        num_val = 0

                    if num_val > best_value:
                        best_value = num_val
                        best_label = label

                if best_label:
                    best_label.click()
                    self.page.wait_for_timeout(200)
                else:
                    # Fallback — click the last available option
                    labels.nth(label_count - 1).click()
                    self.page.wait_for_timeout(200)

            except Exception as e:
                log_error(f"Radio group {i+1}: {e}")

    def _handle_checkboxes(self):
        """Select the first checkbox in each checkbox group."""
        checkbox_groups = self.page.locator("div[data-fieldtype='group']:has(input[type='checkbox'])")
        count = checkbox_groups.count()

        for i in range(count):
            try:
                group = checkbox_groups.nth(i)
                checkboxes = group.locator("input[type='checkbox']")
                if checkboxes.count() > 0:
                    label = group.locator("label:has(input[type='checkbox'])").first
                    label.click()
                    self.page.wait_for_timeout(200)
            except Exception as e:
                log_error(f"Checkbox group {i+1}: {e}")

    def _handle_text_inputs(self):
        """Fill single-line text inputs with sensible default values based on label context."""
        inputs = self.page.locator(
            "input[type='text'][name^='textfield_'], input[type='text'][name^='numeric_']"
        )
        count = inputs.count()
        log_info(f"Found {count} text input fields")

        for i in range(count):
            try:
                inp = inputs.nth(i)
                name = inp.get_attribute("name") or ""

                # Get the associated label text to guess context
                input_id = inp.get_attribute("id") or ""
                label_text = ""
                try:
                    label = self.page.locator(f"label[for='{input_id}']")
                    if label.count() > 0:
                        label_text = label.inner_text().strip().lower()
                except:
                    pass

                value = self._guess_text_value(label_text, name)
                inp.fill(value)
                self.page.wait_for_timeout(200)

            except Exception as e:
                log_error(f"Text input {i+1}: {e}")

    def _guess_text_value(self, label_text: str, field_name: str) -> str:
        """Return a sensible default value based on field label."""
        if "mobile" in label_text or "phone" in label_text or "numeric" in field_name:
            return config.PHONE_NUMBER or "9999999999"
        if "favourite" in label_text or "like" in label_text:
            return "The course content and structure"
        if "industry" in label_text:
            return "Information Technology"
        if "department" in label_text:
            return "Computer Science"
        if "organisation" in label_text or "organization" in label_text or "company" in label_text:
            return "Student"
        if "designation" in label_text:
            return "Student"
        return "N/A"

    def _handle_textareas(self):
        textareas = self.page.locator("textarea[name^='textarea_']")
        count = textareas.count()
        if count == 0:
            return

        log_info(f"Found {count} text area(s)")
        responses = [
            "The course content was well structured and easy to understand. The learning material was comprehensive and helpful.",
            "Nothing significant. The course was overall satisfactory and met my learning expectations."
        ]

        for i in range(count):
            try:
                text = responses[i] if i < len(responses) else "Good course overall."
                textareas.nth(i).fill(text)
                self.page.wait_for_timeout(300)
            except Exception as e:
                log_error(f"Textarea {i+1}: {e}")