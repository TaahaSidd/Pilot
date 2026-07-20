$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DesktopUiDir = Split-Path -Parent $ScriptDir
$RepoRoot = Split-Path -Parent $DesktopUiDir
$PythonDir = Join-Path $RepoRoot "python"
$VenvPython = Join-Path $PythonDir "venv\Scripts\python.exe"
$PythonExe = if (Test-Path $VenvPython) { $VenvPython } else { "python" }
$PilotDataDir = Join-Path $env:LOCALAPPDATA "Pilot"
$PilotConfigDir = Join-Path $PilotDataDir "config"
$PilotNotesDir = Join-Path $PilotDataDir "notes"
$PilotHistoryDir = Join-Path $PilotDataDir "history"
$PilotLogsDir = Join-Path $PilotDataDir "logs"
$PilotProfileDir = Join-Path $PilotDataDir "browser-profile"
$PilotCacheDir = Join-Path $PilotDataDir "cache"
$backendStarted = $false
$backendProcess = $null

@(
  $PilotConfigDir,
  $PilotNotesDir,
  $PilotHistoryDir,
  $PilotLogsDir,
  $PilotProfileDir,
  $PilotCacheDir
) | ForEach-Object {
  New-Item -ItemType Directory -Path $_ -Force | Out-Null
}

$env:PILOT_DATA_DIR = $PilotDataDir
$env:PILOT_CONFIG_DIR = $PilotConfigDir
$env:PILOT_NOTES_DIR = $PilotNotesDir
$env:PILOT_HISTORY_DIR = $PilotHistoryDir
$env:PILOT_LOGS_DIR = $PilotLogsDir
$env:PILOT_PROFILE_DIR = $PilotProfileDir
$env:PILOT_CACHE_DIR = $PilotCacheDir
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

function Test-PilotBackend {
  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/status" -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

if (-not (Test-PilotBackend)) {
  $backendProcess = Start-Process `
    -FilePath $PythonExe `
    -ArgumentList @("-m", "uvicorn", "server:app", "--host", "127.0.0.1", "--port", "8000") `
    -WorkingDirectory $PythonDir `
    -PassThru `
    -WindowStyle Hidden
  $backendStarted = $true
}

try {
  Push-Location $DesktopUiDir
  npm.cmd run dev
} finally {
  Pop-Location
  if ($backendStarted -and $backendProcess -and -not $backendProcess.HasExited) {
    Stop-Process -Id $backendProcess.Id -Force
  }
}
