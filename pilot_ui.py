import warnings
import os
import time
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
    """Show main menu and return user choice."""
    console.print(Panel(
        "\n"
        f"  [bold {PURPLE}][1][/bold {PURPLE}]  Start Pilot\n\n"
        f"  [bold {PURPLE}][2][/bold {PURPLE}]  Settings\n\n"
        f"  [bold {PURPLE}][3][/bold {PURPLE}]  Exit\n",
        title="[bold white]Main Menu[/bold white]",
        border_style=PURPLE,
        width=40
    ))
    return Prompt.ask(f"[bold {PURPLE}]>[/bold {PURPLE}]", choices=["1", "2", "3"])


def show_settings_menu(current_provider: str) -> str:
    """Show AI provider selection menu."""
    console.print(Panel(
        f"\n"
        f"  [bold {PURPLE}][1][/bold {PURPLE}]  Groq  [dim](Llama 3.3 70B — recommended)[/dim]\n\n"
        f"  [bold {PURPLE}][2][/bold {PURPLE}]  Gemini  [dim](2.0 Flash)[/dim]\n\n"
        f"  [bold {PURPLE}][3][/bold {PURPLE}]  Back\n\n"
        f"  Current: [bold {PURPLE}]{current_provider.upper()}[/bold {PURPLE}]\n",
        title="[bold white]AI Provider[/bold white]",
        border_style=PURPLE,
        width=50
    ))
    return Prompt.ask(f"[bold {PURPLE}]>[/bold {PURPLE}]", choices=["1", "2", "3"])


def log_info(message: str):
    console.print(f"[{PURPLE}][PILOT][/{PURPLE}] {message}")


def log_success(message: str):
    console.print(f"[bold green]✓[/bold green] {message}")


def log_warning(message: str):
    console.print(f"[bold yellow]⚠[/bold yellow]  {message}")


def log_error(message: str):
    console.print(f"[bold red]✗[/bold red]  {message}")


def log_skip(message: str):
    console.print(f"[dim]→ SKIP  {message}[/dim]")


def log_page(title: str):
    console.print(
        f"[bold {PURPLE}]●[/bold {PURPLE}]  [white]PAGE[/white]  {title}")


def log_quiz(title: str, ai_answer: str = ""):
    if ai_answer:
        console.print(
            f"[bold {PURPLE}]●[/bold {PURPLE}]  [white]QUIZ[/white]  {title}  [dim]→ {ai_answer}[/dim]")
    else:
        console.print(
            f"[bold {PURPLE}]●[/bold {PURPLE}]  [white]QUIZ[/white]  {title}")


def log_course(title: str, completion: int, current: int, total: int):
    bar_filled = int((completion / 100) * 20)
    bar_empty = 20 - bar_filled
    bar = f"[{PURPLE}]{'█' * bar_filled}[/{PURPLE}][dim]{'░' * bar_empty}[/dim]"
    console.print(
        f"\n[bold white]Course {current}/{total}[/bold white]  {bar}  "
        f"[bold {PURPLE}]{completion}%[/bold {PURPLE}]  [white]{title}[/white]"
    )


def log_module_progress(current: int, total: int, mtype: str, title: str):
    console.print(
        f"  [dim]{current}/{total}[/dim]  "
        f"[bold {PURPLE}]{mtype:<6}[/bold {PURPLE}]  {title}"
    )


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


def show_completion_banner():
    console.print(Panel(
        Align.center(
            Text("✓  All courses processed!", style=f"bold {PURPLE}")
        ),
        border_style="green",
        padding=(1, 4)
    ))


def confirm_login():
    console.print(Panel(
        f"\n  [bold white]Manual Login Required[/bold white]\n\n"
        f"  [dim]Credentials have been filled in for you.[/dim]\n"
        f"  [dim]Please solve the CAPTCHA and click Login.[/dim]\n",
        border_style=PURPLE,
        width=55
    ))
    Prompt.ask(
        f"  [{PURPLE}]Press ENTER once you are on the dashboard[/{PURPLE}]")
