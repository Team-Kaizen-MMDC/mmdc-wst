# Clean demo-videos directory: remove all .webm and .mp4 except the chosen file
# Usage: pwsh -NoProfile -ExecutionPolicy Bypass -File .\demo-videos\clean-demo-videos.ps1

$keep = 'registration-excerpt.mp4'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "Running cleanup in: $dir"

$targets = Get-ChildItem -Path $dir -File | Where-Object { ($_.Extension -ieq '.mp4' -or $_.Extension -ieq '.webm') -and $_.Name -ne $keep }

if(-not $targets){
    Write-Host 'No video files found to delete.'
    exit 0
}

Write-Host 'Files to be deleted:'
$targets | ForEach-Object { Write-Host " - $_.Name" }

# Perform deletion
foreach($f in $targets){
    try{
        Remove-Item -LiteralPath $f.FullName -Force -ErrorAction Stop
        Write-Host "Deleted: $($f.Name)"
    } catch {
        Write-Host "Failed to delete: $($f.Name) - $($_.Exception.Message)"
    }
}

Write-Host "`nRemaining files in ${dir}:"
Get-ChildItem -Path $dir | Select-Object Name,Length | Format-Table -AutoSize
