# AI Background Remover

A browser-based tool for removing backgrounds from images using JavaScript and Canvas API. This tool provides real-time preview and adjustable settings for optimal results.

## Features

- **Drag & Drop Interface**: Simply drag your image into the upload area or click to select
- **Real-time Processing**: Instant background removal with live preview
- **Adjustable Settings**:
  - Sensitivity control for color detection
  - Edge smoothing for cleaner cutouts
- **Transparent PNG Export**: Download your images with transparent backgrounds
- **No Server Required**: Runs entirely in your browser for privacy and speed

## How to Use

1. **Upload an Image**: 
   - Click "Choose Image" button or
   - Drag and drop an image file directly onto the upload area

2. **Adjust Settings**:
   - **Sensitivity (0-1)**: Lower values remove only colors very similar to the background; higher values remove a broader range
   - **Edge Smoothing (0-5)**: Applies smoothing to the edges between subject and background

3. **Download Result**: Click "Download PNG" to save your image with a transparent background

## Technical Details

### Algorithm

The tool uses a color-distance based algorithm:
1. Samples the corner regions to detect the background color
2. Calculates color distance for each pixel
3. Creates an alpha mask based on the threshold
4. Applies smoothing to reduce jagged edges
5. Outputs a PNG with transparency

### Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

Requires HTML5 Canvas support.

## Limitations

- Works best with images that have relatively uniform backgrounds
- Complex backgrounds may require manual adjustment of sensitivity
- Very large images may take longer to process

## Privacy

All processing happens locally in your browser. No images are uploaded to any server.

## Installation

Simply save the `index.html` file and open it in a web browser. No installation or dependencies required.

## License

This tool is provided as-is for personal and commercial use.

---

<div class="footer-badge-container" style="margin-top: 40px; padding: 20px; background-color: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
  <div class="footer-badge-left" style="display: flex; align-items: center; gap: 12px;">
    <img src="https://attest.ink/assets/badges/claude-generated.svg" alt="Claude AI Assisted" style="width: 48px; height: 48px;">
    <div>
      <div style="font-weight: 600; color: #333;">Claude AI Assisted</div>
      <div style="font-size: 0.9em; color: #666;">This content was created with AI assistance</div>
    </div>
  </div>
  <a href="https://attest.ink" target="_blank" style="color: #007bff; text-decoration: none; font-weight: 500;">attest.ink</a>
</div>