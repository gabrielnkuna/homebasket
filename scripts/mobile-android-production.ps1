$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

Write-Host "Building a Play Store Android App Bundle..." -ForegroundColor Cyan
Write-Host "The production profile auto-increments the Android versionCode." -ForegroundColor DarkCyan
npx.cmd eas-cli build --platform android --profile production --wait

