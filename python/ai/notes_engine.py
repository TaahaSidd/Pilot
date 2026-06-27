import os
import re
from groq import Groq
from python.config import GROQ_API_KEY
from python.ui.pilot_ui import log_info, log_success, log_warning, log_error

groq_client = Groq(api_key=GROQ_API_KEY)

NOTES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "notes")


def clean_folder_name(name: str) -> str:
    """Clean section/module name for use as folder name."""
    name = name.strip()
    name = name.lstrip("#").strip()
    name = name.replace(":", " -")
    name = re.sub(r'[<>"/\\|?*]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name


def clean_file_name(name: str) -> str:
    """Clean page title for use as filename."""
    name = name.strip()
    name = re.sub(r'[<>":"/\\|?*]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return f"{name}.md"


def generate_notes(content: str, title: str) -> str:
    """Send page content to Groq and get back structured notes."""
    prompt = f"""You are a student note-taker. Convert the following study material into clear, concise notes.

Rules:
- Use simple, easy to understand language
- Use bullet points only
- No complex words
- Keep it short and to the point
- Format exactly like this:

## Key Points
- point 1
- point 2
- point 3

## Summary
One short paragraph in simple language.

Topic: {title}

Content:
{content[:3000]}

Notes:"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        log_error(f"Groq notes error: {e}")
        return None


def save_note(course_title: str, module_title: str, page_title: str, notes: str):
    """Save generated notes to the correct folder structure."""
    course_folder = clean_folder_name(course_title)
    module_folder = clean_folder_name(module_title)
    file_name = clean_file_name(page_title)

    folder_path = os.path.join(NOTES_DIR, course_folder, module_folder)
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, file_name)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(f"# {page_title}\n\n")
        f.write(notes)
        f.write("\n")

    log_success(f"Note saved → {module_folder}/{file_name}")


class NotesEngine:
    def __init__(self, page):
        self.page = page
        self.current_module = "General"

    def run(self):
        log_info("Starting notes generation run...")
        os.makedirs(NOTES_DIR, exist_ok=True)

        # Verify we're on dashboard before scanning
        from python.config import URL
        current_url = self.page.url
        if "/my/" not in current_url.lower() and "dashboard" not in current_url.lower():
            log_info("Navigating to dashboard...")
            self.page.goto(URL + "/my/")
            self.page.wait_for_load_state("domcontentloaded")
            self.page.wait_for_timeout(3000)

        log_info(f"Current URL: {self.page.url}")

        from python.workflow.workflow import Workflow
        wf = Workflow(self.page)
        wf.stabilize_page()
        courses = wf.get_course_urls()

        log_info(f"Found {len(courses)} courses")

        for course in courses:
            try:
                self._process_course(course)
            except Exception as e:
                log_error(f"Course failed → {course['title']}: {e}")

        log_success("Notes generation complete — saved to /notes/")

    log_success(f"Notes generation complete — saved to /notes/")

    def _process_course(self, course: dict):
        log_info(f"Processing → {course['title']}")
        self.page.goto(course["url"])
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        # Get all sections and their modules
        sections = self.page.locator("div.courseindex-section")
        section_count = sections.count()

        for s in range(section_count):
            try:
                section = sections.nth(s)

                # Get section title
                section_title = ""
                try:
                    section_title = section.locator("a.courseindex-link[data-for='section_title']").inner_text().strip()
                except:
                    section_title = f"Section {s+1}"

                # Only process sections that look like modules (#Module...)
                if not section_title:
                    continue

                # Get all PAGE links in this section
                page_links = section.locator("a.courseindex-link[href*='/mod/page/']")
                link_count = page_links.count()

                if link_count == 0:
                    continue

                log_info(f"Section: {section_title} — {link_count} pages")

                # Collect all page urls and titles first
                pages = []
                for p in range(link_count):
                    try:
                        link = page_links.nth(p)
                        href = link.get_attribute("href") or ""
                        title = link.inner_text().strip()
                        if href:
                            pages.append({"url": href, "title": title})
                    except:
                        pass

                # Visit each page and generate notes
                for page_info in pages:
                    try:
                        self._process_page(course["title"], section_title, page_info)
                    except Exception as e:
                        log_error(f"Page failed → {page_info['title']}: {e}")

                    # Go back to course page after each page visit
                    self.page.goto(course["url"])
                    self.page.wait_for_load_state("domcontentloaded")
                    self.page.wait_for_timeout(1500)

            except Exception as e:
                log_error(f"Section {s+1}: {e}")

    def _process_page(self, course_title: str, section_title: str, page_info: dict):
        log_info(f"Generating notes → {page_info['title']}")

        self.page.goto(page_info["url"])
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        # Try multiple selectors to extract content
        content = ""
        selectors = [
            "div.no-overflow",
            "div.box.py-3.generalbox",
            "div#region-main",
            "div[role='main']",
            "div.course-content",
            "section#region-main",
        ]

        for selector in selectors:
            try:
                el = self.page.locator(selector).first
                if el.count() > 0:
                    text = el.inner_text().strip()
                    if len(text) > 200:
                        content = text
                        break
            except:
                continue

        # Last resort — get all visible text from body
        if not content or len(content) < 200:
            try:
                content = self.page.locator("body").inner_text().strip()
            except:
                pass

        if not content or len(content) < 200:
            log_warning(f"Content too short — skipping {page_info['title']}")
            return

        log_info(f"Content captured ({len(content)} chars)")

        # Generate notes via Groq
        notes = generate_notes(content, page_info["title"])

        if not notes:
            log_warning(f"No notes generated for {page_info['title']}")
            return

        save_note(course_title, section_title, page_info["title"], notes)