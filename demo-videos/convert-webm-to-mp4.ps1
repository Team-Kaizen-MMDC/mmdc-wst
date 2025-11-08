<#
Convert all .webm files in this directory to .mp4 using ffmpeg.
Creates friendly copies for the two main demo files.

Usage (PowerShell):
  pwsh ./convert-webm-to-mp4.ps1
  or
  ./convert-webm-to-mp4.ps1

Requirements: ffmpeg must be installed and available on PATH.
Download: https://ffmpeg.org/download.html
#>

param(
    [switch]$VerboseOutput
)

function Write-Log($msg){ if($VerboseOutput){ Write-Host $msg } }

$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if(-not $ffmpeg){
    Write-Error "ffmpeg not found in PATH. Install ffmpeg and ensure it's available in your PATH. See https://ffmpeg.org/download.html"
    exit 1
}

$srcDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if(-not $srcDir){ $srcDir = Get-Location }

Push-Location $srcDir
try{
    $webms = Get-ChildItem -Path $srcDir -Filter *.webm -File | Sort-Object Name
    if($webms.Count -eq 0){ Write-Host "No .webm files found in $srcDir"; exit 0 }

    foreach($f in $webms){
        $mp4 = [System.IO.Path]::ChangeExtension($f.FullName, ".mp4")
        Write-Host "Converting $($f.Name) -> $(Split-Path $mp4 -Leaf)"
        & ffmpeg -y -i $f.FullName -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 128k -movflags +faststart $mp4
        if($LASTEXITCODE -ne 0){
            Write-Error "Conversion failed for $($f.Name) (ffmpeg exit code $LASTEXITCODE). Aborting."
            exit $LASTEXITCODE
        }
    }

    # Create friendly copies for two primary demo files (if present)
    $friendlyMap = @{
        "japan-ssw-demo-video.webm" = "registration-excerpt.mp4"
        "japan-ssw-full-demo-end-to-end.webm" = "registration-full-1080p.mp4"
    }

    foreach($k in $friendlyMap.Keys){
        $srcWebm = Join-Path $srcDir $k
        $srcMp4 = [System.IO.Path]::ChangeExtension($srcWebm, ".mp4")
        $dest = Join-Path $srcDir $friendlyMap[$k]
        if(Test-Path $srcMp4){
            if(-not (Test-Path $dest)){
                Copy-Item -Path $srcMp4 -Destination $dest
                Write-Host "Created friendly copy: $(Split-Path $dest -Leaf)"
            } else {
                Write-Host "Friendly name already exists: $(Split-Path $dest -Leaf)"
            }
        } else {
            Write-Host "Skipping friendly copy for $k (converted file not found)."
        }
    }

    Write-Host "Conversion completed successfully."
} finally {
    Pop-Location
}
