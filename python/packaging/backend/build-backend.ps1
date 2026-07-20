$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PythonDir = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$VenvPython = Join-Path $PythonDir "venv\Scripts\python.exe"
$PythonExe = if (Test-Path $VenvPython) { $VenvPython } else { "python" }
$SpecFile = Join-Path $ScriptDir "pilot-backend.spec"
$OutputExe = Join-Path $PythonDir "dist\pilot-backend\pilot-backend.exe"

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  & $FilePath @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code ${LASTEXITCODE}: $FilePath $($Arguments -join ' ')"
  }
}

Write-Host "[Pilot] Python dir: $PythonDir"
Write-Host "[Pilot] Python exe: $PythonExe"
Write-Host "[Pilot] Spec file:  $SpecFile"

Push-Location $PythonDir
try {
  $env:PYTHONNOUSERSITE = "1"
  $version = & $PythonExe -m PyInstaller --version
  if ($LASTEXITCODE -ne 0) {
    throw "PyInstaller is not installed for $PythonExe. Install it with: .\venv\Scripts\python.exe -m pip install -r .\packaging\backend\requirements-packaging.txt"
  }

  Write-Host "[Pilot] PyInstaller: $version"
  Invoke-Checked $PythonExe -m PyInstaller --clean --noconfirm $SpecFile

  if (-not (Test-Path $OutputExe)) {
    throw "Build finished but output exe was not found: $OutputExe"
  }

  Write-Host "[Pilot] Built: $OutputExe"
} finally {
  Pop-Location
}
