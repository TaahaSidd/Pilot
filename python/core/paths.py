import os
from pathlib import Path


PYTHON_ROOT = Path(__file__).resolve().parents[1]


def _env_path(name: str) -> Path | None:
    value = os.environ.get(name)
    if not value:
        return None
    return Path(value).expanduser().resolve()


def _data_root() -> Path | None:
    return _env_path("PILOT_DATA_DIR")


def _resolve_dir(env_name: str, packaged_name: str, cli_default: str) -> Path:
    explicit = _env_path(env_name)
    if explicit:
        explicit.mkdir(parents=True, exist_ok=True)
        return explicit

    data_root = _data_root()
    if data_root:
        path = data_root / packaged_name
        path.mkdir(parents=True, exist_ok=True)
        return path

    path = PYTHON_ROOT / cli_default
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_data_dir() -> Path:
    data_root = _data_root()
    if data_root:
        data_root.mkdir(parents=True, exist_ok=True)
        return data_root

    return PYTHON_ROOT


def get_config_dir() -> Path:
    return _resolve_dir("PILOT_CONFIG_DIR", "config", ".")


def get_notes_dir() -> Path:
    return _resolve_dir("PILOT_NOTES_DIR", "notes", "notes")


def get_history_dir() -> Path:
    return _resolve_dir("PILOT_HISTORY_DIR", "history", os.path.join("data", "sessions"))


def get_logs_dir() -> Path:
    return _resolve_dir("PILOT_LOGS_DIR", "logs", "logs")


def get_profile_dir() -> Path:
    return _resolve_dir("PILOT_PROFILE_DIR", "browser-profile", "profile")


def get_cache_dir() -> Path:
    return _resolve_dir("PILOT_CACHE_DIR", "cache", "cache")


def get_config_file() -> Path:
    config_file = _env_path("PILOT_CONFIG_FILE")
    if config_file:
        config_file.parent.mkdir(parents=True, exist_ok=True)
        return config_file

    return get_config_dir() / "user_config.json"


DATA_DIR = str(get_data_dir())
CONFIG_DIR = str(get_config_dir())
CONFIG_FILE = str(get_config_file())
NOTES_DIR = str(get_notes_dir())
HISTORY_DIR = str(get_history_dir())
LOGS_DIR = str(get_logs_dir())
PROFILE_DIR = str(get_profile_dir())
CACHE_DIR = str(get_cache_dir())
