$ErrorActionPreference = "SilentlyContinue"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$runtimeDir = Join-Path $projectRoot ".runtime"

function Stop-PortProcess($port) {
  $matches = netstat -ano | Select-String ":$port\s+.*LISTENING\s+(\d+)$"
  foreach ($match in $matches) {
    if ($match.Matches.Count -gt 0) {
      $procId = $match.Matches[0].Groups[1].Value
      if ($procId) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
      }
    }
  }
}

foreach ($name in "backend.pid", "frontend.pid") {
  $path = Join-Path $runtimeDir $name
  if (Test-Path $path) {
    $procId = Get-Content $path
    if ($procId) {
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Remove-Item $path -Force
  }
}

foreach ($port in 3000, 8010) {
  Stop-PortProcess $port
}

Write-Host "AI Pulse Tracker stopped."
