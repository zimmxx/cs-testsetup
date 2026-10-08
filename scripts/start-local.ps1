$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectDirectory
$pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue
if ($pnpmCommand) {
    $pnpmPath = $pnpmCommand.Source
} else {
    $pnpmPath = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm.cmd'
    if (-not (Test-Path -LiteralPath $pnpmPath)) {
        throw 'Install Node.js 22.12+ and pnpm 11.19.0, then run pnpm install and pnpm dev.'
    }
}
if (-not (Test-Path -LiteralPath (Join-Path $projectDirectory 'node_modules'))) {
    & $pnpmPath install --frozen-lockfile
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
Write-Host 'CORNERSTONE Test Setup: http://localhost:5174/'
& $pnpmPath dev
