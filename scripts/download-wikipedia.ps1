param([string]$Destination = 'F:\Wikipedia')
$ErrorActionPreference = 'Stop'
$name = 'wikipedia_en_all_maxi_2026-08.zim'
$url = "https://download.kiwix.org/zim/wikipedia/$name"
$expectedBytes = 127418087648
$expectedHash = '34162d18b9f96f494eac48a73a309c72e0bc95d85f76be405d0f5de795854aa6'
$folder = [System.IO.Path]::GetFullPath($Destination)
New-Item -ItemType Directory -Path $folder -Force | Out-Null
$final = Join-Path $folder $name
$partial = "$final.part"
$statusFile = Join-Path $folder 'download-status.json'
function Save-Status([string]$State, [string]$Message) {
  $bytes = 0
  if (Test-Path -LiteralPath $partial) { $bytes = (Get-Item -LiteralPath $partial).Length }
  if (Test-Path -LiteralPath $final) { $bytes = (Get-Item -LiteralPath $final).Length }
  @{state=$State; message=$Message; file=$final; url=$url; bytes=$bytes; expectedBytes=$expectedBytes; sha256=$expectedHash; updated=(Get-Date).ToUniversalTime().ToString('o'); pid=$PID} | ConvertTo-Json | Set-Content -LiteralPath $statusFile -Encoding utf8
}
function Get-Sha256([string]$Path) {
  $algorithm = [System.Security.Cryptography.SHA256]::Create()
  $stream = [System.IO.File]::OpenRead($Path)
  try { return ([System.BitConverter]::ToString($algorithm.ComputeHash($stream))).Replace('-', '').ToLowerInvariant() }
  finally { $stream.Dispose(); $algorithm.Dispose() }
}
try {
  if (-not (Test-Path -LiteralPath $final)) {
    $partialBytes = 0
    if (Test-Path -LiteralPath $partial) { $partialBytes = (Get-Item -LiteralPath $partial).Length }
    if ($partialBytes -gt $expectedBytes) { throw 'Partial file is larger than the expected archive; inspect it before resuming.' }
    if ($partialBytes -lt $expectedBytes) {
      Save-Status 'downloading' 'Resumable download from the official Kiwix mirror network.'
      & curl.exe --fail --location --silent --show-error --retry 20 --retry-all-errors --retry-delay 10 --connect-timeout 30 --speed-limit 1024 --speed-time 120 --continue-at - --output $partial $url
      if ($LASTEXITCODE -ne 0) { throw "curl exited with code $LASTEXITCODE. Run this script again to resume." }
    }
    if ((Get-Item -LiteralPath $partial).Length -ne $expectedBytes) { throw 'Downloaded file size does not match the official manifest.' }
    Save-Status 'verifying' 'Checking the full archive SHA-256 against the official Kiwix metalink.'
    $hash = Get-Sha256 $partial
    if ($hash -ne $expectedHash) { throw 'SHA-256 mismatch. Partial archive retained for inspection; no verified archive was published.' }
    Move-Item -LiteralPath $partial -Destination $final
  } else {
    Save-Status 'verifying' 'Checking existing archive.'
    if ((Get-Sha256 $final) -ne $expectedHash) { throw 'Existing archive checksum does not match.' }
  }
  Save-Status 'complete' 'Archive downloaded and SHA-256 verified.'
} catch {
  Save-Status 'failed' $_.Exception.Message
  Write-Error $_
  exit 1
}
