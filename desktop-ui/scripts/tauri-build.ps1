$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DesktopUiDir = Split-Path -Parent $ScriptDir
$RepoRoot = Split-Path -Parent $DesktopUiDir
$BackendDist = Join-Path $RepoRoot "python\dist\pilot-backend"
$BackendExe = Join-Path $BackendDist "pilot-backend.exe"
$ResourceRoot = Join-Path $DesktopUiDir "src-tauri\resources"
$BackendResource = Join-Path $ResourceRoot "pilot-backend"

if (-not (Test-Path $BackendExe)) {
  throw "Packaged backend not found: $BackendExe. Run python\packaging\backend\build-backend.ps1 first."
}

if (Test-Path $BackendResource) {
  Remove-Item -LiteralPath $BackendResource -Recurse -Force
}

New-Item -ItemType Directory -Path $ResourceRoot -Force | Out-Null
Copy-Item -Path $BackendDist -Destination $BackendResource -Recurse -Force

Push-Location $DesktopUiDir
try {
  npm.cmd run build
} finally {
  Pop-Location
}
