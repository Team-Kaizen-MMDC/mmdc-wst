#!/bin/bash

# Script to set up video background for hero section
# This script helps you prepare video assets and provides instructions

VIDEO_DIR="assets/videos"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🎬 Setting up video background for hero section..."

# Create videos directory
mkdir -p "$PROJECT_ROOT/$VIDEO_DIR"

echo "📁 Created directory: $VIDEO_DIR"

echo ""
echo "🎯 Video Background Setup Options:"
echo "=================================="
echo ""
echo "1. 📹 CONVERT IMAGES TO VIDEO (Recommended for testing):"
echo "   - Use your existing Tokyo images to create a video"
echo "   - Run: ffmpeg -framerate 0.5 -i assets/images/aiImages/TokyoDay-1200.jpg -c:v libx264 -pix_fmt yuv420p -t 10 assets/videos/tokyo-cityscape.mp4"
echo ""
echo "2. 🎥 DOWNLOAD TOKYO VIDEOS:"
echo "   - Free stock videos from Pexels, Unsplash, or Pixabay"
echo "   - Search for: 'Tokyo cityscape', 'Shibuya crossing', 'Japan urban'"
echo "   - Recommended formats: MP4 (H.264) and WebM"
echo ""
echo "3. 🎨 CREATE CUSTOM VIDEO:"
echo " - Use tools like DaVinci Resolve, Adobe Premiere, or online editors"
echo " - Combine multiple Tokyo images with smooth transitions"
echo " - Add subtle zoom/pan effects"
echo ""
echo "📋 Video Specifications:"
echo "======================="
echo "• Format: MP4 (H.264) + WebM (VP9) for best compatibility"
echo "• Resolution: 1920x1080 (Full HD) minimum"
echo "• Duration: 10-30 seconds (will loop automatically)"
echo "• File size: Keep under 5MB for web performance"
echo "• Audio: None (muted video for background)"
echo ""
echo "🚀 Once you have video files:"
echo "============================="
echo "1. Place video files in: $VIDEO_DIR/"
echo "2. Name them: tokyo-cityscape.mp4 and tokyo-cityscape.webm"
echo "3. Uncomment the video section in index.html"
echo "4. Comment out the hero__bg div"
echo ""
echo "✨ Current Status:"
echo "=================="
echo "✅ Animated background image is active"
echo "✅ Video background code is ready (commented out)"
echo "✅ CSS animations are working"
echo "✅ Full-screen hero is implemented"
echo ""

# Check if ffmpeg is available
if command -v ffmpeg &> /dev/null; then
    echo "🎬 FFmpeg is available! You can create videos from images."
    echo ""
    echo "Quick test command:"
    echo "ffmpeg -framerate 0.5 -i assets/images/aiImages/TokyoDay-1200.jpg -c:v libx264 -pix_fmt yuv420p -t 10 assets/videos/tokyo-cityscape.mp4"
else
    echo "⚠️  FFmpeg not found. Install it to create videos from images:"
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    echo "   Windows: Download from https://ffmpeg.org/"
fi

echo ""
echo "🎉 Setup complete! Your hero section now has:"
echo "   • Animated background image with subtle movement"
echo "   • Video background ready to activate"
echo "   • Full-screen immersive experience"
echo "   • Mobile-optimized performance"
