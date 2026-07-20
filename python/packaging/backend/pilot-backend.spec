# -*- mode: python ; coding: utf-8 -*-

from pathlib import Path
import os

from PyInstaller.utils.hooks import collect_data_files, collect_submodules


ROOT = Path(SPECPATH).parents[1]

datas = []
hiddenimports = []

hiddenimports += [
    "server",
]

for package in [
    "fastapi",
    "pydantic",
    "starlette",
    "uvicorn",
    "playwright",
    "groq",
    "google",
    "rich",
]:
    datas += collect_data_files(package)
    hiddenimports += collect_submodules(package)

datas += [
    (str(ROOT / "prompts"), "prompts"),
]

playwright_browser_root = Path(
    os.environ.get("PLAYWRIGHT_BROWSERS_PATH")
    or os.environ.get("LOCALAPPDATA", "")
) / "ms-playwright"

chromium_dir = playwright_browser_root / "chromium-1223"
if chromium_dir.exists():
    datas += [
        (
            str(chromium_dir),
            "playwright/driver/package/.local-browsers/chromium-1223",
        ),
    ]
else:
    print(f"[Pilot] Playwright Chromium not found at: {chromium_dir}")
    print("[Pilot] Run: python -m playwright install chromium")

a = Analysis(
    [str(ROOT / "backend_entry.py")],
    pathex=[str(ROOT)],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[str(Path(SPECPATH) / "hooks")],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="pilot-backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="pilot-backend",
)
