#!/bin/bash

# Script to split a 3x3 grid of company logos into individual files
# Input: 1024x1024 image with 9 logos in a 3x3 grid
# Output: 9 individual logo files (341x341 each)

INPUT_IMAGE="assets/images/company-logos/image.png"
OUTPUT_DIR="assets/images/company-logos/"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Logo size (each logo is 1/3 of 1024 = 341px)
LOGO_SIZE=341

# Company names in order (top to bottom, left to right)
COMPANIES=(
    "ana-intercontinental"
    "prince-hotels" 
    "sompo-care"
    "nissan"
    "daikin"
    "kandenko"
    "yoshinoya"
    "ana"
    "mitsubishi-heavy-industries"
)

echo "Splitting company logos from $INPUT_IMAGE..."

# Split the image into 9 logos
for row in {0..2}; do
    for col in {0..2}; do
        # Calculate position
        x=$((col * LOGO_SIZE))
        y=$((row * LOGO_SIZE))
        
        # Calculate index (0-8)
        index=$((row * 3 + col))
        
        # Get company name
        company="${COMPANIES[$index]}"
        
        # Output filename
        output_file="${OUTPUT_DIR}${company}-logo.png"
        
        echo "Extracting logo $((index + 1))/9: $company at position ($x, $y)"
        
        # Extract the logo using sips
        sips --cropOffset $y $x --cropToHeightWidth $LOGO_SIZE $LOGO_SIZE "$INPUT_IMAGE" --out "$output_file"
        
        if [ $? -eq 0 ]; then
            echo "✓ Created: $output_file"
        else
            echo "✗ Failed to create: $output_file"
        fi
    done
done

echo "Logo splitting complete!"
echo "Individual logo files created in: $OUTPUT_DIR"
