# AI Background Remover - Professional Edition

A powerful browser-based tool for removing backgrounds from images using advanced JavaScript algorithms and Canvas API. Features multiple processing modes, real-time preview, and professional-grade edge refinement.

## ✨ Features

### Core Functionality
- **Instant Background Removal**: Process images directly in your browser with no server uploads
- **Multiple Processing Modes**:
  - **Auto Mode**: Smart AI-powered background detection
  - **Manual Mode**: Click-to-select specific background colors
  - **Advanced Mode**: Choose algorithms and fine-tune post-processing
- **Real-time Preview**: See changes instantly as you adjust settings
- **High-Quality Output**: Maintains original image resolution and quality

### Advanced Controls
- **Background Detection Sensitivity** (0-1): Fine-tune how aggressively backgrounds are detected
- **Edge Refinement** (0-10px): Professional Gaussian blur for smooth edges
- **Feathering** (0-20px): Natural edge transitions that blend seamlessly
- **Color Tolerance** (0-100%): Precision control for manual color selection

### Post-Processing Options
- **Despeckle**: Automatically removes small islands of pixels
- **Smooth Edges**: Applies Gaussian blur for professional results
- **Preserve Details**: Maintains fine details in complex images

### User Experience
- **Drag & Drop Support**: Simply drag images onto the upload area
- **Multiple Format Support**: JPG, PNG, GIF, WebP (up to 50MB)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Processing Statistics**: View image dimensions, processing time, and removal percentage
- **Compare Mode**: Toggle between original and processed images instantly

## 🚀 How to Use

### Quick Start
1. **Upload an Image**: 
   - Click "Choose Image" button or
   - Drag and drop an image file directly onto the upload area

2. **Select Processing Mode**:
   - **Auto Mode** (Default): Best for most images with clear backgrounds
   - **Manual Mode**: For specific color backgrounds or complex images
   - **Advanced Mode**: For fine-tuning with different algorithms

3. **Adjust Settings** (Optional):
   - Use sliders to fine-tune the removal process
   - See changes in real-time as you adjust

4. **Download Result**: 
   - Click "Download PNG" to save your transparent image
   - Original resolution and quality are preserved

### Advanced Usage

#### Manual Mode
1. Switch to Manual Mode
2. Click on the background area of your image to select the color
3. Adjust Color Tolerance to include similar shades
4. Fine-tune with edge refinement controls

#### Advanced Mode
1. Choose from different algorithms:
   - **Flood Fill**: Best for uniform backgrounds
   - **Chroma Key**: Ideal for green/blue screens
   - **Threshold**: For high-contrast images
   - **Edge Detection**: For complex backgrounds
2. Enable post-processing options as needed
3. Combine with other controls for optimal results

## 🔧 Technical Details

### Algorithms

The tool employs several sophisticated algorithms:

1. **Smart Background Detection**:
   - Multi-corner sampling for accurate color detection
   - Statistical analysis to find dominant background colors
   - Adaptive thresholding based on image characteristics

2. **Edge Processing**:
   - Gaussian blur implementation for smooth transitions
   - Feathering algorithm for natural edges
   - Anti-aliasing to prevent jagged edges

3. **Color Analysis**:
   - RGB color space # AI Background Remover

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