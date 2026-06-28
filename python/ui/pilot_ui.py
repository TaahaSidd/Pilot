import warnings
import os
import time
import queue
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn
from rich.live import Live
from rich.align import Align
from rich import box

warnings.filterwarnings("ignore", category=FutureWarning,
                        module="google.generativeai")

console = Console()

PURPLE = "#AA00FF"
DIM = "dim white"

_broadcast_queue: "queue.Queue | None" = None


def attach_broadcast_queue(q: "queue.Queue"):
    """Called by server.py before starting a Pilot run on its
    background thread. CLI usage never calls this, so plain
    `python main.py` runs are unaffected."""
    global _broadcast_queue
    _broadcast_queue = q


def detach_broadcast_queue():
    """Called by server.py once a run finishes, so a stale queue
    from a previous run can't leak into the next one."""
    global _broadcast_queue
    _broadcast_queue = None


def _broadcast(level: str, message: str):
    """Push a structured log event onto the queue if one is attached.
    Never raises — a broadcast failure must never break the CLI or
    the automation run itself."""
    if _broadcast_queue is None:
        return
    try:
        _broadcast_queue.put_nowait({"level": level, "message": message})
    except Exception:
        pass


def display_banner():
    os.system('cls' if os.name == 'nt' else 'clear')

    ascii_logo = """
██████╗ ██╗██╗      ██████╗ ████████╗
██╔══██╗██║██║     ██╔═══██╗╚══██╔══╝
██████╔╝██║██║     ██║   ██║   ██║   
██╔═══╝ ██║██║     ██║   ██║   ██║   
██║     ██║███████╗╚██████╔╝   ██║   
╚═╝     ╚═╝╚══════╝ ╚═════╝    ╚═╝   """

    console.print(Panel(
        Align.center(
            Text(ascii_logo, style=f"bold {PURPLE}")
        ),
        subtitle="[dim]Powered by Spica Labs[/dim]",
        border_style=PURPLE,
        padding=(0, 4)
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
        width=40
    ))
    return Prompt.ask(f"[bold {PURPLE}]>[/bold {PURPLE}]", choices=["1", "2", "3", "4"])


def show_settings_menu(current_provider: str) -> str:
    console.print(Panel(
        f"\n"
        f"  [bold {PURPLE}][1][/bold {PURPLE}]  Reset credentials\n\n"
        f"  [bold {PURPLE}][2][/bold {PURPLE}]  Back\n",
        title="[bold white]Settings[/bold white]",
        border_style=PURPLE,
        width=50
    ))
    return Prompt.ask(f"[bold {PURPLE}]>[/bold {PURPLE}]", choices=["1", "2"])


def log_info(message: str):
    console.print(f"[{PURPLE}][PILOT][/{PURPLE}] {message}")
    _broadcast("info", message)


def log_success(message: str):
    console.print(f"[bold green]✓[/bold green] {message}")
    _broadcast("success", message)


def log_warning(message: str):
    console.print(f"[bold yellow]⚠[/bold yellow]  {message}")
    _broadcast("warning", message)


def log_error(message: str):
    console.print(f"[bold red]✗[/bold red]  {message}")
    _broadcast("error", message)


def log_skip(message: str):
    console.print(f"[dim]→ SKIP  {message}[/dim]")
    _broadcast("skip", message)


def log_page(title: str):
    console.print(
        f"[bold {PURPLE}]●[/bold {PURPLE}]  [white]PAGE[/white]  {title}")
    _broadcast("page", title)


def log_quiz(title: str, ai_answer: str = ""):
    if ai_answer:
        console.print(
            f"[bold {PURPLE}]●[/bold {PURPLE}]  [white]QUIZ[/white]  {title}  [dim]→ {ai_answer}[/dim]")
        _broadcast("quiz", f"{title} → {ai_answer}")
    else:
        console.print(
            f"[bold {PURPLE}]●[/bold {PURPLE}]  [white]QUIZ[/white]  {title}")
        _broadcast("quiz", title)


def log_course(title: str, completion: int, current: int, total: int):
    bar_filled = int((completion / 100) * 20)
    bar_empty = 20 - bar_filled
    bar = f"[{PURPLE}]{'█' * bar_filled}[/{PURPLE}][dim]{'░' * bar_empty}[/dim]"
    console.print(
        f"\n[bold white]Course {current}/{total}[/bold white]  {bar}  "
        f"[bold {PURPLE}]{completion}%[/bold {PURPLE}]  [white]{title}[/white]"
    )
    _broadcast("course", f"Course {current}/{total} — {title} ({completion}%)")


def log_module_progress(current: int, total: int, mtype: str, title: str):
    console.print(
        f"  [dim]{current}/{total}[/dim]  "
        f"[bold {PURPLE}]{mtype:<6}[/bold {PURPLE}]  {title}"
    )
    _broadcast("module", f"{current}/{total} {mtype} — {title}")


def show_course_summary(courses: list[dict]):
    table = Table(
        title="Course Summary",
        box=box.ROUNDED,
        border_style=PURPLE,
        header_style=f"bold {PURPLE}",
        show_lines=False
    )
    table.add_column("Course", style="white", no_wrap=False)
    table.add_column("Progress", justify="center")
    table.add_column("Status", justify="center")

    for course in courses:
        pct = course["completion"]
        bar_filled = int((pct / 100) * 15)
        bar_empty = 15 - bar_filled
        bar = f"{'█' * bar_filled}{'░' * bar_empty} {pct}%"

        if pct == 100:
            status = "[bold green]✓ Done[/bold green]"
        else:
            status = f"[bold {PURPLE}]In Progress[/bold {PURPLE}]"

        table.add_row(course["title"], bar, status)

    console.print()
    console.print(table)
    console.print()

    # mirror a plain-text summary to the broadcast queue — rich Table
    # objects don't serialize to JSON for the WebSocket, so send the
    # same data as plain rows instead
    _broadcast("summary", [
        {"title": c["title"], "completion": c["completion"]} for c in courses
    ])


def show_completion_banner():
    console.print(Panel(
        Align.center(
            Text("✓  All courses processed!", style=f"bold {PURPLE}")
        ),
        border_style="green",
        padding=(1, 4)
    ))
    _broadcast("success", "All courses processed!")


def confirm_login():
    console.print(Panel(
        f"\n  [bold white]Manual Login Required[/bold white]\n\n"
        f"  [dim]Credentials have been filled in for you.[/dim]\n"
        f"  [dim]Please solve the CAPTCHA and click Login.[/dim]\n",
        border_style=PURPLE,
        width=55
    ))
    _broadcast("action_required", "Manual login required — solve the CAPTCHA, then continue.")
    Prompt.ask(
        f"  [{PURPLE}]Press ENTER once you are on the dashboard[/{PURPLE}]")