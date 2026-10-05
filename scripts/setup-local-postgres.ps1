$ErrorActionPreference = "Stop"
$pgBin = "C:\Program Files\PostgreSQL\17\bin"
$pgData = "C:\Program Files\PostgreSQL\17\data"
$hba = Join-Path $pgData "pg_hba.conf"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)
if (-not $isAdmin) {
  throw "Administrator 권한으로 실행해야 합니다."
}

$original = Get-Content $hba -Raw
$trusted = $original.Replace(
  "host    all             all             127.0.0.1/32            scram-sha-256",
  "host    all             all             127.0.0.1/32            trust"
).Replace(
  "host    all             all             ::1/128                 scram-sha-256",
  "host    all             all             ::1/128                 trust"
)
Set-Content -Path $hba -Value $trusted -Encoding ascii
& "$pgBin\pg_ctl.exe" reload -D $pgData
Start-Sleep -Seconds 2

function Invoke-Psql([string]$cmd) {
  & "$pgBin\psql.exe" -h 127.0.0.1 -p 5432 -U postgres -d postgres -v ON_ERROR_STOP=0 -c $cmd
}

Invoke-Psql "DO `$`$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ickoa') THEN CREATE ROLE ickoa LOGIN PASSWORD 'ickoa' CREATEDB; ELSE ALTER ROLE ickoa WITH LOGIN PASSWORD 'ickoa' CREATEDB; END IF; END `$`$;"
$exists = & "$pgBin\psql.exe" -h 127.0.0.1 -p 5432 -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'ickoa'"
if (-not $exists.Trim()) {
  Invoke-Psql "CREATE DATABASE ickoa OWNER ickoa;"
}
Invoke-Psql "GRANT ALL PRIVILEGES ON DATABASE ickoa TO ickoa;"

Set-Content -Path $hba -Value $original -Encoding ascii
& "$pgBin\pg_ctl.exe" reload -D $pgData

Write-Output "OK: ickoa / ickoa @ localhost:5432 / ickoa"
