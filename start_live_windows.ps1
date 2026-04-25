$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$runtimeDir = Join-Path $projectRoot ".runtime"
$appDir = Join-Path $projectRoot "app"

function Stop-PortProcess($port) {
  $matches = netstat -ano | Select-String ":$port\s+.*LISTENING\s+(\d+)$"
  foreach ($match in $matches) {
    if ($match.Matches.Count -gt 0) {
      $procId = $match.Matches[0].Groups[1].Value
      if ($procId) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
      }
    }
  }
}

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

try {
  $pythonExe = (& py -3.12 -c "import sys; print(sys.executable)").Trim()
} catch {
  throw "Python 3.12 is required. Please make sure py -3.12 is available."
}

foreach ($port in 3000, 8010) {
  Stop-PortProcess $port
}

$backendOut = Join-Path $runtimeDir "backend.out.log"
$backendErr = Join-Path $runtimeDir "backend.err.log"
$frontendOut = Join-Path $runtimeDir "frontend.out.log"
$frontendErr = Join-Path $runtimeDir "frontend.err.log"

Set-Content -Path $backendOut -Value ""
Set-Content -Path $backendErr -Value ""
Set-Content -Path $frontendOut -Value ""
Set-Content -Path $frontendErr -Value ""

$backend = Start-Process `
  -FilePath $pythonExe `
  -ArgumentList "-m", "uvicorn", "app.main:app", "--app-dir", "backend", "--host", "127.0.0.1", "--port", "8010" `
  -WorkingDirectory $projectRoot `
  -RedirectStandardOutput $backendOut `
  -RedirectStandardError $backendErr `
  -WindowStyle Hidden `
  -PassThru

$frontend = Start-Process `
  -FilePath $pythonExe `
  -ArgumentList "-m", "http.server", "3000", "--bind", "127.0.0.1" `
  -WorkingDirectory $appDir `
  -RedirectStandardOutput $frontendOut `
  -RedirectStandardError $frontendErr `
  -WindowStyle Hidden `
  -PassThru

$backend.Id | Set-Content (Join-Path $runtimeDir "backend.pid")
$frontend.Id | Set-Content (Join-Path $runtimeDir "frontend.pid")

Start-Sleep -Seconds 5

Write-Host "AI Pulse Tracker started."
Write-Host "Backend: http://127.0.0.1:8010"
Write-Host "Frontend: http://127.0.0.1:3000"
Write-Host "Logs: $runtimeDir"
