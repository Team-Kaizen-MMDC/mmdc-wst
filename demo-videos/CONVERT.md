# Conversion instructions

This directory contains the WebM demo recordings used in the repository.

To convert all .webm files to .mp4 on Windows (PowerShell):

1. Install ffmpeg and ensure it's on your PATH: [ffmpeg downloads](https://ffmpeg.org/download.html)

2. Run the bundled script from this folder (PowerShell):

```powershell
# from repository root
pwsh .\demo-videos\convert-webm-to-mp4.ps1
```

The script will:

- Convert every .webm file in `demo-videos/` to an .mp4 using libx264/aac.
- Create two friendly-named MP4 copies if the source files exist:
  - `japan-ssw-demo-video.webm` -> `registration-excerpt.mp4`
  - `japan-ssw-full-demo-end-to-end.webm` -> `registration-full-1080p.mp4`

If you prefer running ffmpeg commands manually, the core command used is:

```powershell
ffmpeg -i input.webm -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 128k -movflags +faststart output.mp4
```

Notes:

- The script overwrites converted MP4s created by ffmpeg with the same base name.
- The friendly copies are only created if the converted MP4 exists and the friendly name doesn't already exist.
