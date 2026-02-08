$procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -match 'RealStateAI' }
if ($procs) {
  foreach ($p in $procs) {
    try {
      Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
      Write-Output "Killed PID $($p.ProcessId)"
    } catch {
      Write-Output "Failed to kill PID $($p.ProcessId): $_"
    }
  }
} else {
  Write-Output "No matching processes found."
}
