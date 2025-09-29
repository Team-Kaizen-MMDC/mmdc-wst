#!/bin/bash

# Script to convert PNG company logos to WebP format
# Creates both WebP and PNG versions for optimal web performance

INPUT_DIR="assets/images/company-logos/"
OUTPUT_DIR="assets/images/company-logos/"

echo "Converting company logos to WebP format..."

# List of logo files to convert
LOGOS=(
    "ANA.png"
    "ANA_InterContinental.png"
    "Prince_Hotels.png"
    "sompocare.png"
    "Nissan.png"
    "Daikin_1.png"
    "Kandenko.png"
    "Yoshinoya.png"
    "Mitsubishi_Heavy_Industries.png"
)

for logo in "${LOGOS[@]}"; do
    input_file="${INPUT_DIR}${logo}"
    output_file="${OUTPUT_DIR}${logo%.png}.webp"
    
    if [ -f "$input_file" ]; then
        echo "Converting: $logo"
        cwebp -q 85 -m 6 "$input_file" -o "$output_file"
        
        if [ $? -eq 0 ]; then
            # Show file size comparison
            png_size=$(ls -lah "$input_file" | awk '{print $5}')
            webp_size=$(ls -lah "$output_file" | awk '{print $5}')
            echo "  ✓ PNG: $png_size → WebP: $webp_size"
        else
            echo "  ✗ Failed to convert: $logo"
        fi
    else
        echo "  ⚠ File not found: $logo"
    fi
done

echo "WebP conversion complete!"
echo "Generated WebP files:"
ls -lah "${OUTPUT_DIR}"*.webp 2>/dev/null || echo "No WebP files found"
