# Pilot Backend Packaging

This packages the shared Python backend into a Windows executable:

```text
pilot-backend.exe
```

The CLI remains unchanged. This executable is only the FastAPI backend entrypoint used by the desktop app.

## Install packaging tool

Use the project virtual environment:

```powershell
cd C:\Users\VICTUS\Desktop\Pilot\python
.\venv\Scripts\python.exe -m pip install -r .\packaging\backend\requirements-packaging.txt
```

## Build

```powershell
cd C:\Users\VICTUS\Desktop\Pilot\python
.\packaging\backend\build-backend.ps1
```

Expected output:

```text
python/dist/pilot-backend/pilot-backend.exe
```

## Run manually

```powershell
$env:PILOT_DATA_DIR="$env:LOCALAPPDATA\Pilot"
.\dist\pilot-backend\pilot-backend.exe
```

Then check:

```powershell
Invoke-WebRequest http://127.0.0.1:8000/status -UseBasicParsing
```

## Playwright browser runtime

Playwright needs a Chromium runtime.

Phase 4 first goal is to package and run the Python backend executable.
After that, choose one browser strategy:

1. Bundle Chromium with Pilot.
   - Larger installer.
   - More reliable for students.

2. Download Chromium during setup or first launch.
   - Smaller installer.
   - Needs network and a first-run installer flow.

Pilot should prefer bundling Chromium for a student-facing desktop app.
