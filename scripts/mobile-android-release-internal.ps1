$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

Write-Host "Building and auto-submitting Android to Google Play Internal testing..." -ForegroundColor Cyan
Write-Host "This uses the production build profile and the internal submit profile." -ForegroundColor DarkCyan
Write-Host "The production profile auto-increments the Android versionCode." -ForegroundColor DarkCyan
npx.cmd eas-cli build --platform android --profile production --auto-submit-with-profile internal --wait

