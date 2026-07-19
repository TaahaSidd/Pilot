EXCLUDED_COURSE_TITLE_PARTS = (
    "free certificate course",
)


def is_excluded_course_title(title: str | None) -> bool:
    if not title:
        return False

    normalized = " ".join(title.lower().split())
    return any(part in normalized for part in EXCLUDED_COURSE_TITLE_PARTS)


def filter_visible_courses(courses: list[dict]) -> list[dict]:
    return [
        course
        for course in courses
        if not is_excluded_course_title(str(course.get("title", "")))
    ]
