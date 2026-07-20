import os
import sys

import uvicorn


def configure_stdio() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")


def run_packaging_smoke() -> None:
    smoke = os.environ.get("PILOT_BACKEND_SMOKE")
    if smoke != "playwright":
        return

    from core.browser import Browser

    browser = Browser()
    try:
        print("playwright ok")
    finally:
        browser.close()
    raise SystemExit(0)


def main() -> None:
    configure_stdio()
    run_packaging_smoke()

    host = os.environ.get("PILOT_BACKEND_HOST", "127.0.0.1")
    port = int(os.environ.get("PILOT_BACKEND_PORT", "8000"))

    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        log_level=os.environ.get("PILOT_BACKEND_LOG_LEVEL", "info"),
        access_log=os.environ.get("PILOT_BACKEND_ACCESS_LOG", "1") != "0",
    )


if __name__ == "__main__":
    main()
