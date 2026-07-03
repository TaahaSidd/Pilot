import threading
import warnings
import os
import queue
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt
from rich.table import Table
from rich.align import Align
from rich import box

from runtime.history import history
from runtime.state import (
    state,
    ACTION_READING_PAGE,
    ACTION_PROCESSING_QUIZ,
    ACTION_OPENING_COURSE,
    ACTION_PROCESSING_MODULE,
    ACTION_WAITING_LOGIN,
    ACTION_LOGIN_CONFIRMED,
    ACTION_DONE,
    ACTION_ERROR,
)

warnings.filterwarnings("ignore", category=FutureWarning,
                        module="google.generativeai")

console = Console()

PURPLE = "#AA00FF"
DIM = "dim white"

_broadcast_queue: "queue.Queue | None" = None
_login_event: "threading.Event | None" = None


def attach_broadcast_queue(q: "queue.Queue"):
    global _broadcast_queue
    _broadcast_queue = q


def detach_broadcast_queue():
    global _broadcast_queue
    _broadcast_queue = None


def _broadcast(level: str, message):
    if _broadcast_queue is None:
        return

    try:
        _broadcast_queue.put_nowait({
            "level": level,
            "message": message,
            "state": state.to_dict(),
        })
    except Exception:
        pass


def _record(level: str, message):
    try:
        history.append_log(level, message)
    except Exception:
        pass


def _emit(level: str, message):
    _record(level, message)
    _broadcast(level, message)


def prepare_server_login_wait() -> "threading.Event":
    global _login_event
    _login_event = threading.Event()
    return _login_event


def clear_server_login_wait():
    global _login_event
    _login_event = None
    state.set_login_wait(False)


def display_banner():
    os.system("cls" if os.name == "nt" else "clear")

    ascii_logo = """
██████╗ ██╗██╗      ██████╗ ████████╗
██╔══██╗██║██║     ██╔═══██╗╚══██╔══╝
██████╔╝██║██║     ██║   ██║   ██║   
██╔═══╝ ██║██║     ██║   ██║   ██║   
██║     ██║███████╗╚██████╔╝   ██║   
╚═╝     ╚═╝╚══════╝ ╚═════╝    ╚═╝   """

    console.print(Panel(
        Align.center(Text(ascii_logo, style=f"bold {PURPLE}")),
        subtitle="[dim]Powered by Spica Labs[/dim]",
        border_style=PURPLE,
        padding=(0, 4),
    ))
    console.print()


def show_menu() -> str:
    console.print(Panel(
        "\n"
        f"  [bold {PURPLE}][1][/bold {PURPLE}]  Complete Modules\n\n"
        f"  [bold {PURPLE}][2][/bold {PURPLE}]  Generate Notes\n\n"
        f"  [bold {PURPLE}][3][/bold {PURPLE}]  Settings\n\n"
        f"  [bold {PURPLE}][4][/bold {PURPLE}]  Exit\n",
        title="[bold white]Main Menu[/bold white]",
        border_style=PURPLE,
        width=40,
    ))
    return Prompt.ask(f"[bold {PURPLE}]>[/bold {PURPLE}]", choices=["1", "2", "3", "4"])


def show_settings_menu(current_provider: str) -> str:
    console.print(Panel(
        f"\n"
        f"  [bold {PURPLE}][1][/bold {PURPLE}]  Reset credentials\n\n"
        f"  [bold {PURPLE}][2][/bold {PURPLE}]  Back\n",
        title="[bold white]Settings[/bold white]",
        border_style=PURPLE,
        width=50,
    ))
    return Prompt.ask(f"[bold {PURPLE}]>[/bold {PURPLE}]", choices=["1", "2"])


def log_info(message: str):
    console.print(f"[{PURPLE}][PILOT][/{PURPLE}] {message}")
    _emit("info", message)


def log_success(message: str):
    console.print(f"[bold green]✓[/bold green] {message}")
    _emit("success", message)


def log_warning(message: str):
    console.print(f"[bold yellow]⚠[/bold yellow]  {message}")
    _emit("warning", message)


def log_error(message: str):
    state.set_action(ACTION_ERROR, message)
    state.error = message
    console.print(f"[bold red]✗[/bold red]  {message}")
    _emit("error", message)


def log_skip(message: str):
    console.print(f"[dim]→ SKIP  {message}[/dim]")
    _emit("skip", message)


def log_page(title: str):
    state.set_page(title)
    state.set_action(ACTION_READING_PAGE, f"Reading page: {title}")

    history.increment_summary("pages_processed")

    console.print(
        f"[bold {PURPLE}]●[/bold {PURPLE}]  [white]PAGE[/white]  {title}"
    )
    _emit("page", title)


def log_quiz(title: str, ai_answer: str = ""):
    state.set_action(ACTION_PROCESSING_QUIZ, f"Processing quiz: {title}")

    history.increment_summary("quizzes_processed")

    if ai_answer:
        message = f"{title} → {ai_answer}"
        console.print(
            f"[bold {PURPLE}]●[/bold {PURPLE}]  [white]QUIZ[/white]  {title}  [dim]→ {ai_answer}[/dim]"
        )
        _emit("quiz", message)
    else:
        console.print(
            f"[bold {PURPLE}]●[/bold {PURPLE}]  [white]QUIZ[/white]  {title}"
        )
        _emit("quiz", title)


def log_course(title: str, completion: int, current: int, total: int):
    state.set_course(title, current, total, completion)
    state.set_action(ACTION_OPENING_COURSE, f"Processing course: {title}")

    history.update_summary({
        "courses_total": total,
        "current_course": title,
        "course_progress_percent": completion,
    })

    history.increment_summary("courses_processed")

    bar_filled = int((completion / 100) * 20)
    bar_empty = 20 - bar_filled
    bar = f"[{PURPLE}]{'█' * bar_filled}[/{PURPLE}][dim]{'░' * bar_empty}[/dim]"

    console.print(
        f"\n[bold white]Course {current}/{total}[/bold white]  {bar}  "
        f"[bold {PURPLE}]{completion}%[/bold {PURPLE}]  [white]{title}[/white]"
    )

    _emit("course", {
        "title": title,
        "completion": completion,
        "current": current,
        "total": total,
    })


def log_module_progress(current: int, total: int, mtype: str, title: str):
    state.set_module(title, current, total, mtype)
    state.set_action(ACTION_PROCESSING_MODULE, f"Processing {mtype}: {title}")

    history.update_summary({
        "modules_total": total,
        "current_module": title,
        "current_module_type": mtype,
        "module_current_index": current,
    })

    history.increment_summary("modules_started")

    console.print(
        f"  [dim]{current}/{total}[/dim]  "
        f"[bold {PURPLE}]{mtype:<6}[/bold {PURPLE}]  {title}"
    )

    _emit("module", {
        "current": current,
        "total": total,
        "type": mtype,
        "title": title,
    })


def show_course_summary(courses: list[dict]):
    table = Table(
        title="Course Summary",
        box=box.ROUNDED,
        border_style=PURPLE,
        header_style=f"bold {PURPLE}",
        show_lines=False,
    )
    table.add_column("Course", style="white", no_wrap=False)
    table.add_column("Progress", justify="center")
    table.add_column("Status", justify="center")

    for course in courses:
        pct = course["completion"]
        bar_filled = int((pct / 100) * 15)
        bar_empty = 15 - bar_filled
        bar = f"{'█' * bar_filled}{'░' * bar_empty} {pct}%"

        status = (
            "[bold green]✓ Done[/bold green]"
            if pct == 100
            else f"[bold {PURPLE}]In Progress[/bold {PURPLE}]"
        )
        table.add_row(course["title"], bar, status)

    console.print()
    console.print(table)
    console.print()

    summary = [
        {
            "id": c.get("id"),
            "title": c["title"],
            "completion": c["completion"],
            "image": c.get("image", ""),
            "category": c.get("category", ""),
        }
        for c in courses
    ]

    history.update_summary({
        "courses": summary,
        "courses_found": len(summary),
        "courses_completed_before_run": sum(
            1 for c in courses if c["completion"] == 100
        ),
    })

    _emit("summary", summary)


def show_completion_banner():
    state.set_action(ACTION_DONE, "All courses processed")

    console.print(Panel(
        Align.center(Text("✓  All courses processed!",
                     style=f"bold {PURPLE}")),
        border_style="green",
        padding=(1, 4),
    ))
    _emit("success", "All courses processed!")


def confirm_login():
    if _login_event is not None:
        state.set_login_wait(True)
        state.set_action(
            ACTION_WAITING_LOGIN,
            "Waiting for manual login confirmation",
        )

        message = (
            "Manual login required — solve the CAPTCHA in the browser window, "
            "then confirm in the dashboard."
        )

        _emit("action_required", message)
        _login_event.wait()

        state.set_login_wait(False)
        state.set_action(ACTION_LOGIN_CONFIRMED, "Manual login confirmed")
        _emit("info", "Manual login confirmed")
        return

    console.print(Panel(
        f"\n  [bold white]Manual Login Required[/bold white]\n\n"
        f"  [dim]Credentials have been filled in for you.[/dim]\n"
        f"  [dim]Please solve the CAPTCHA and click Login.[/dim]\n",
        border_style=PURPLE,
        width=55,
    ))

    Prompt.ask(
        f"  [{PURPLE}]Press ENTER once you are on the dashboard[/{PURPLE}]")
