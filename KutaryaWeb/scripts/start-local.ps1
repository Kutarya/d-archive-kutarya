param([switch]$NoSeed, [switch]$Reseed)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $taskRoot
$null = New-Item -ItemType Directory -Path (Join-Path $taskRoot 'artifacts') -Force
if (-not (Test-Path -LiteralPath (Join-Path $taskRoot 'node_modules'))) { & npm.cmd install }
if (-not (Test-Path -LiteralPath (Join-Path $taskRoot 'functions\node_modules'))) { & npm.cmd install --prefix functions }
$env:FUNCTIONS_DISCOVERY_TIMEOUT = '60'
if (-not (Test-Path -LiteralPath (Join-Path $taskRoot 'functions\.secret.local'))) {
 [IO.File]::WriteAllText((Join-Path $taskRoot 'functions\.secret.local'), "MOBILE_MAIL_PASS=local-emulator-only`n", [Text.UTF8Encoding]::new($false))
}
if (-not (Test-Path -LiteralPath (Join-Path $taskRoot 'functions\.env.local'))) {
 [IO.File]::WriteAllText((Join-Path $taskRoot 'functions\.env.local'), "GAMES_MAIL_USER=local@kutarya.test`n", [Text.UTF8Encoding]::new($false))
}
$startedEmulators = $false
if (-not (Get-NetTCPConnection -LocalPort 5005 -State Listen -ErrorAction SilentlyContinue)) {
 $startedEmulators = $true
 $emulatorArguments = '-NoProfile -Command "$env:FUNCTIONS_DISCOVERY_TIMEOUT=''60''; Set-Location -LiteralPath ''' + $taskRoot + '''; firebase emulators:start --project demo-kutarya-games --only auth,firestore,functions,storage"'
 Start-Process powershell.exe -ArgumentList $emulatorArguments -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskRoot 'artifacts\emulators-start.log') -RedirectStandardError (Join-Path $taskRoot 'artifacts\emulators-error.log')
}
for ($attempt=0; $attempt -lt 60; $attempt++) {
 try { $null = Invoke-RestMethod -Uri 'http://127.0.0.1:5005/demo-kutarya-games/europe-west1/gamesService' -Method Post -ContentType 'application/json' -Body '{"data":{"op":"catalog"}}'; break } catch { Start-Sleep -Seconds 1 }
}
if ($attempt -ge 60) { throw 'Yerel servis başlayamadı; artifacts içindeki logları incele.' }
$localCredentials = Join-Path $taskRoot 'artifacts\local-credentials.json'
if (-not $NoSeed -and ($Reseed -or $startedEmulators -or -not (Test-Path -LiteralPath $localCredentials))) { & npm.cmd run seed:local }
if (-not (Get-NetTCPConnection -LocalPort 5180 -State Listen -ErrorAction SilentlyContinue)) {
 Start-Process powershell.exe -ArgumentList ('-NoProfile -Command "Set-Location -LiteralPath ''' + $taskRoot + '''; npm.cmd run dev"') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskRoot 'artifacts\vite-start.log') -RedirectStandardError (Join-Path $taskRoot 'artifacts\vite-error.log')
}
Write-Host 'Kutarya: http://127.0.0.1:5180/ — Yönetim: /admin. Yerel test hesapları artifacts/local-credentials.json dosyasındadır.'
