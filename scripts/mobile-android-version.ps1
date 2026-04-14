$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

Write-Host "Reading the latest Android version stored on EAS..." -ForegroundColor Cyan
npx.cmd eas-cli build:version:get --platform android --profile production

