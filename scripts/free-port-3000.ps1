# Termina i processi in LISTENING sulla porta 3000 (Windows).
# Uso: npm run dev:kill   oppure   powershell -File scripts/free-port-3000.ps1

$lines = netstat -ano | Select-String ':3000\s' | Select-String 'LISTENING'
$listenPids = @{}
foreach ($line in $lines) {
  $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
  $procId = [int]$parts[-1]
  if ($procId -gt 0) { $listenPids[$procId] = $true }
}
foreach ($procId in $listenPids.Keys) {
  try {
    Stop-Process -Id $procId -Force -ErrorAction Stop
    Write-Host "Terminated PID $procId"
  } catch {
    Write-Host "Could not kill PID $procId : $_"
  }
}
if ($listenPids.Count -eq 0) {
  Write-Host "No LISTENING process on port 3000."
}
exit 0
