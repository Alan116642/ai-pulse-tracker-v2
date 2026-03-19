$ErrorActionPreference = "Stop"

param(
  [string]$RepoUrl = ""
)

if (-not $RepoUrl) {
  $RepoUrl = Read-Host "请输入 GitHub 仓库 URL（例如 https://github.com/<user>/<repo>.git）"
}

if (-not $RepoUrl) {
  throw "未提供仓库 URL。"
}

$currentRemote = git remote
if ($currentRemote -match "origin") {
  git remote set-url origin $RepoUrl
} else {
  git remote add origin $RepoUrl
}

git push -u origin main

Write-Host ""
Write-Host "已推送到 GitHub。"
Write-Host "接下来到仓库 Settings -> Pages，确认 Source 为 GitHub Actions。"
Write-Host "然后在 Actions 里运行："
Write-Host "1. Deploy GitHub Pages"
Write-Host "2. Refresh Live Data"
