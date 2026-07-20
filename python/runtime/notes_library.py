import os
from typing import Optional

from core.paths import NOTES_DIR


def _safe_join(base: str, *paths: str) -> str:
    """
    Prevent path traversal.

    Only allow files inside NOTES_DIR.
    """
    final_path = os.path.abspath(os.path.join(base, *paths))
    base_path = os.path.abspath(base)

    if os.path.commonpath([base_path, final_path]) != base_path:
        raise ValueError("Invalid path")

    return final_path


def _rel(path: str) -> str:
    return os.path.relpath(path, NOTES_DIR).replace("\\", "/")


def get_notes_tree() -> dict:
    os.makedirs(NOTES_DIR, exist_ok=True)

    courses = []

    for course_name in sorted(os.listdir(NOTES_DIR)):
        course_path = os.path.join(NOTES_DIR, course_name)

        if not os.path.isdir(course_path):
            continue

        modules = []

        for module_name in sorted(os.listdir(course_path)):
            module_path = os.path.join(course_path, module_name)

            if not os.path.isdir(module_path):
                continue

            notes = []

            for file_name in sorted(os.listdir(module_path)):
                if not file_name.endswith(".md"):
                    continue

                file_path = os.path.join(module_path, file_name)

                notes.append({
                    "title": file_name.removesuffix(".md"),
                    "file_name": file_name,
                    "path": _rel(file_path),
                    "updated_at": os.path.getmtime(file_path),
                })

            if notes:
                modules.append({
                    "title": module_name,
                    "path": _rel(module_path),
                    "notes": notes,
                    "note_count": len(notes),
                })

        if modules:
            courses.append({
                "title": course_name,
                "path": _rel(course_path),
                "modules": modules,
                "module_count": len(modules),
                "note_count": sum(m["note_count"] for m in modules),
            })

    return {
        "root": os.path.abspath(NOTES_DIR),
        "courses": courses,
        "course_count": len(courses),
        "note_count": sum(c["note_count"] for c in courses),
    }


def read_note_file(path: str) -> Optional[dict]:
    try:
        file_path = _safe_join(NOTES_DIR, path)
    except ValueError:
        return None

    if not os.path.exists(file_path):
        return None

    if not os.path.isfile(file_path):
        return None

    if not file_path.endswith(".md"):
        return None

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    return {
        "path": path.replace("\\", "/"),
        "title": os.path.basename(file_path).removesuffix(".md"),
        "content": content,
        "updated_at": os.path.getmtime(file_path),
    }
