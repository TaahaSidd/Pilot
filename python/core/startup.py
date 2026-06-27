import os
import json
from python.ui.pilot_ui import log_info, log_success, log_warning
from rich.prompt import Prompt
from rich.console import Console

console = Console()

CONFIG_FILE = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), "..", "user_config.json")
PURPLE = "#AA00FF"


def is_configured() -> bool:
    """Check if user has already set up their credentials."""
    if not os.path.exists(CONFIG_FILE):
        return False
    try:
        with open(CONFIG_FILE) as f:
            data = json.load(f)
        return all(k in data for k in ("groq_api_key", "username", "password", "phone_number"))
    except:
        return False


def save_config(data: dict):
    with open(CONFIG_FILE, "w") as f:
        json.dump(data, f, indent=2)


def load_config() -> dict:
    with open(CONFIG_FILE) as f:
        return json.load(f)


def run_onboarding():
    console.print(
        f"\n[bold {PURPLE}]Welcome to Pilot![/bold {PURPLE}] Let's get you set up.\n")
    console.print(
        "[dim]Your credentials are stored locally and never shared.[/dim]\n")

    console.print(f"[bold {PURPLE}]Groq API Key[/bold {PURPLE}]")
    groq_key = Prompt.ask("  >")

    console.print(f"[bold {PURPLE}]Amity Student Email[/bold {PURPLE}]")
    username = Prompt.ask("  >")

    console.print(f"[bold {PURPLE}]AMIGO Portal Password[/bold {PURPLE}]")
    password = Prompt.ask("  >")

    console.print(f"[bold {PURPLE}]Enter your phone number (for feedback forms)[/bold {PURPLE}]")
    phone_number = Prompt.ask("  >")
    

    save_config({
        "groq_api_key": groq_key,
        "username": username,
        "password": password,
        "phone_number" : phone_number
    })

    log_success("Setup complete — credentials saved locally")
