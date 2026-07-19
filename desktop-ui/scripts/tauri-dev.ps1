$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DesktopUiDir = Split-Path -Parent $ScriptDir
$RepoRoot = Split-Path -Parent $DesktopUiDir
$PythonDir = Join-Path $RepoRoot "python"
$VenvPython = Join-Path $PythonDir "venv\Scripts\python.exe"
$PythonExe = if (Test-Path $VenvPython) { $VenvPython } else { "python" }
$backendStarted = $false
$backendProcess = $null

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
