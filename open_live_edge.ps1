$ErrorActionPreference = "Stop"

$edgeExe = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$url = "http://127.0.0.1:3000"

if (-not (Test-Path $edgeExe)) {
  throw "Microsoft Edge not found: $edgeExe"
}

Start-Process `
  -FilePath $edgeExe `
  -ArgumentList "--inprivate", "--disable-extensions", "--new-window", $url

Write-Host "Opened AI Pulse Tracker in Edge (InPrivate, extensions disabled): $url"
