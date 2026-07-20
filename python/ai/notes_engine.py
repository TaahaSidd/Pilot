import os
import re
from typing import Optional

from groq import Groq

import config
from config import URL
from core.paths import NOTES_DIR
from runtime.history import history
from runtime.state import (
    state,
    ACTION_SCANNING_COURSES,
    ACTION_OPENING_COURSE,
    ACTION_GENERATING_NOTES,
    ACTION_SAVING_NOTES,
)
from ui.pilot_ui import log_info, log_success, log_warning, log_error
from workflow.workflow import Workflow


class GroqRateLimitReached(Exception):
    pass


def _should_stop() -> bool:
    if state.stop_requested:
        log_warning("Notes generation stopped by user")
        return True
    return False


def get_groq_client():
    return Groq(api_key=config.GROQ_API_KEY)


def _is_rate_limit_error(error: Exception) -> bool:
    error_text = str(error).lower()
    return (
        "rate_limit" in error_text
        or "rate limit" in error_text
        or "429" in error_text
        or "tokens per day" in error_text
    )


def clean_folder_name(name: str) -> str:
    name = name.strip()
    name = name.lstrip("#").strip()
    name = name.replace(":", " -")
    name = re.sub(r'[<>"/\\|?*]', "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def clean_file_name(name: str) -> str:
    name = name.strip()
    name = re.sub(r'[<>":"/\\|?*]', "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return f"{name}.md"


def generate_notes(content: str, title: str) -> Optional[str]:
    prompt = f"""You are an expert exam-focused study note maker.

Convert the study material into detailed, easy-to-revise notes for a student.

Rules:
- Use simple language
- Keep all important concepts
- Focus on exam-relevant points
- Add definitions where needed
- Add examples where helpful
- Add important keywords
- Do NOT add information outside the given content
- Do NOT make it too short
- Use clear headings and bullet points

Format exactly like this:

## Topic Overview
- Explain what this topic is about in simple words.

## Important Concepts
- Cover the main points in detail.
- Include definitions, steps, types, features, advantages, disadvantages, or uses if present.

## Exam-Focused Points
- List points that are likely useful for exams.
- Keep them direct and memorable.

## Key Terms
- Term: simple meaning
- Term: simple meaning

## Quick Revision Summary
- Short bullet-point recap for last-minute revision.

Topic: {title}

Study Material:
{content[:5000]}

Notes:"""

    try:
        response = get_groq_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        if _is_rate_limit_error(e):
            raise GroqRateLimitReached() from e

        log_error("Groq could not generate notes for this page. Skipping it.")
        return None


def save_note(course_title: str, module_title: str, page_title: str, notes: str):
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

    state.set_action(ACTION_SAVING_NOTES, f"Saving note: {page_title}")
    history.increment_summary("notes_saved")

    log_success(f"Note saved: {module_folder}/{file_name}")


class NotesEngine:
    def __init__(self, page):
        self.page = page

    def run(self):
        log_info("Starting notes generation run...")
        os.makedirs(NOTES_DIR, exist_ok=True)

        if _should_stop():
            return

        current_url = self.page.url
        if "/my/" not in current_url.lower() and "dashboard" not in current_url.lower():
            log_info("Navigating to dashboard...")
            self.page.goto(URL + "/my/")
            self.page.wait_for_load_state("domcontentloaded")
            self.page.wait_for_timeout(3000)

        if _should_stop():
            return

        state.set_action(ACTION_SCANNING_COURSES, "Scanning courses for notes")
        log_info(f"Current URL: {self.page.url}")

        wf = Workflow(self.page)
        wf.stabilize_page()
        courses = wf.get_course_urls()

        history.update_summary({
            "courses_found": len(courses),
            "notes_output_dir": os.path.normpath(NOTES_DIR),
        })

        log_info(f"Found {len(courses)} courses")

        for course in courses:
            if _should_stop():
                return

            try:
                self._process_course(course)
            except GroqRateLimitReached:
                return
            except Exception as e:
                if _should_stop():
                    return
                log_error(f"Course failed: {course['title']}: {e}")

        log_success("Notes generation complete - saved to /notes/")

    def _process_course(self, course: dict):
        if _should_stop():
            return

        title = course["title"]

        state.set_course(
            title=title,
            current=1,
            total=1,
            completion=course.get("completion", 0),
        )
        state.set_action(ACTION_OPENING_COURSE,
                         f"Opening course for notes: {title}")

        history.increment_summary("courses_processed")
        history.update_summary({
            "current_course": title,
        })

        log_info(f"Processing: {title}")

        self.page.goto(course["url"])
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        if _should_stop():
            return

        sections = self.page.locator("div.courseindex-section")
        section_count = sections.count()

        history.update_summary({
            "sections_found": section_count,
        })

        for s in range(section_count):
            if _should_stop():
                return

            try:
                section = sections.nth(s)

                try:
                    section_title = section.locator(
                        "a.courseindex-link[data-for='section_title']"
                    ).inner_text().strip()
                except:
                    section_title = f"Section {s + 1}"

                if not section_title:
                    continue

                page_links = section.locator(
                    "a.courseindex-link[href*='/mod/page/']")
                link_count = page_links.count()

                if link_count == 0:
                    continue

                history.increment_summary("sections_processed")
                history.increment_summary("pages_found", link_count)

                log_info(f"Section: {section_title} - {link_count} pages")

                pages = []
                for p in range(link_count):
                    try:
                        link = page_links.nth(p)
                        href = link.get_attribute("href") or ""
                        page_title = link.inner_text().strip()

                        if href:
                            pages.append({
                                "url": href,
                                "title": page_title,
                            })
                    except:
                        pass

                for page_info in pages:
                    if _should_stop():
                        return

                    try:
                        self._process_page(title, section_title, page_info)
                    except Exception as e:
                        if _should_stop():
                            return
                        history.increment_summary("notes_errors")
                        log_error(f"Page failed: {page_info['title']}: {e}")

                    if _should_stop():
                        return

                    self.page.goto(course["url"])
                    self.page.wait_for_load_state("domcontentloaded")
                    self.page.wait_for_timeout(1500)

            except Exception as e:
                if _should_stop():
                    return
                history.increment_summary("notes_errors")
                log_error(f"Section {s + 1}: {e}")

    def _process_page(self, course_title: str, section_title: str, page_info: dict):
        if _should_stop():
            return

        page_title = page_info["title"]

        state.set_page(page_title)
        state.set_module(
            title=page_title,
            current=history.current_session.get(
                "summary", {}).get("notes_attempted", 0) + 1
            if history.current_session else 1,
            total=history.current_session.get(
                "summary", {}).get("pages_found", 0)
            if history.current_session else 0,
            mtype="NOTES",
        )
        state.set_action(ACTION_GENERATING_NOTES,
                         f"Generating notes: {page_title}")

        history.increment_summary("notes_attempted")

        log_info(f"Generating notes: {page_title}")

        self.page.goto(page_info["url"])
        self.page.wait_for_load_state("domcontentloaded")
        self.page.wait_for_timeout(2000)

        if _should_stop():
            return

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

        if not content or len(content) < 200:
            try:
                content = self.page.locator("body").inner_text().strip()
            except:
                pass

        if not content or len(content) < 200:
            history.increment_summary("notes_skipped")
            log_warning(f"Content too short. Skipping {page_title}")
            return

        log_info(f"Content captured ({len(content)} chars)")

        try:
            notes = generate_notes(content, page_title)
        except GroqRateLimitReached:
            history.increment_summary("notes_errors")
            history.update_summary({
                "stop_reason": "groq_rate_limit",
            })
            log_warning(
                "Groq API limit reached. Notes generation stopped. Try again after the quota resets."
            )
            state.request_stop()
            raise

        if not notes:
            history.increment_summary("notes_skipped")
            log_warning(f"No notes generated for {page_title}")
            return

        save_note(course_title, section_title, page_title, notes)

        history.increment_summary("notes_generated")
        state.complete_module()
