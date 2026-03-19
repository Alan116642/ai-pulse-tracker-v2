param(
  [string]$RepoUrl = ""
)

$ErrorActionPreference = "Stop"

if (-not $RepoUrl) {
  $RepoUrl = Read-Host "Enter GitHub repository URL"
}

if (-not $RepoUrl) {
  throw "Repository URL is required."
}

$currentRemote = git remote
if ($currentRemote -match "origin") {
  git remote set-url origin $RepoUrl
} else {
  git remote add origin $RepoUrl
}

git push -u origin main

Write-Host ""
Write-Host "Push completed."
Write-Host "Next steps:"
Write-Host "1. Open the repository on GitHub."
Write-Host "2. Go to Settings -> Pages."
Write-Host "3. Make sure Source is GitHub Actions."
Write-Host "4. In Actions, run 'Deploy GitHub Pages' and 'Refresh Live Data' if they do not start automatically."
