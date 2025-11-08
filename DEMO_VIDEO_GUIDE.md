# Demo Video Script Usage

## Latest Video

**Filename**: `japan-ssw-full-demo-end-to-end.webm`

- Complete end-to-end user journey demonstration
- Includes signup, login, and contact form interactions
- 1080p resolution with slow motion and click highlights

## Quick Start

To record a new demo video:

```bash
node record-demo.js
```

The script will:

- Launch a visible browser window
- Navigate through all major pages automatically
- Record the entire session at 1080p
- Save the video to `demo-videos/` directory

## Video Features

✅ 1920x1080 (Full HD) resolution  
✅ 500ms slow motion for better visibility  
✅ Click highlights with pulse animations  
✅ Smooth scrolling with easing  
✅ Form interactions with realistic typing  
✅ Page navigation demonstrations  
✅ WebM format (widely supported)

## Customization Options

Edit `record-demo.js` to customize:

- **Speed**: Change `slowMo: 500` (in milliseconds)
- **Resolution**: Modify viewport width/height
- **Wait times**: Adjust `waitForTimeout()` values
- **Navigation flow**: Add/remove sections
- **Form data**: Change demo user information

## Converting to Other Formats

If you need MP4 format, use FFmpeg:

```bash
ffmpeg -i japan-ssw-full-demo-end-to-end.webm -c:v libx264 -preset slow -crf 22 japan-ssw-full-demo-end-to-end.mp4
```

## Notes

- The demo runs in non-headless mode so you can see what's being recorded
- Each run generates a new video file with a unique hash name
- Rename videos immediately for easier identification
- Total recording time: ~3-4 minutes depending on network speed
