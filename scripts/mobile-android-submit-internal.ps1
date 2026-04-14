$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

Write-Host "Submitting the latest Android AAB to Google Play Internal testing..." -ForegroundColor Cyan
npx.cmd eas-cli submit --platform android --profile internal --latest --wait

