// Global variables
let currentImage = null;
let originalImageData = null;
let currentMode = 'auto';
let selectedColor = { r: 255, g: 255, b: 255 };
let isComparing = false;
let processingStartTime = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupDragAndDrop();
});

function setupEventListeners() {
    // File input
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);

    // Mode buttons
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchMode(e.target.dataset.mode);
        });
    });

    // Sliders
    const sliders = ['sensitivity', 'edge', 'feather', 'tolerance'];
    sliders.forEach(name => {
        const slider = document.getElementById(name + 'Slider');
        if (slider) {
            slider.addEventListener('input', (e) => {
                updateSliderValue(name, e.target.value);
                if (currentImage) processImage();
            });
        }
    });

    // Advanced controls
    document.getElementById('algorithmSelect').addEventListener('change', () => {
        if (currentImage) processImage();
    });

    // Color picker
    document.getElementById('colorPreview').addEventListener('click', () => {
        document.getElementById('colorPicker').click();
    });

    document.getElementById('colorPicker').addEventListener('change', (e) => {
        const hex = e.target.value;
        selectedColor = hexToRgb(hex);
        document.getElementById('colorPreview').style.background = hex;
        if (currentImage) processImage();
    });

    // Canvas click for color selection
    document.getElementById('originalCanvas').addEventListener('click', handleCanvasClick);
}

function setupDragAndDrop() {
    const uploadSection = document.getElementById('uploadSection');

    uploadSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadSection.classList.add('dragover');
    });

    uploadSection.addEventListener('dragleave', () => {
        uploadSection.classList.remove('dragover');
    });

    uploadSection.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    showProcessing();
    processingStartTime = Date.now();

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            displayOriginal();
            processImage();
            updateStats(file);
            document.getElementById('uploadSection').classList.add('has-image');
            document.getElementById('workspace').style.display = 'block';
            hideProcessing();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayOriginal() {
    const canvas = document.getElementById('originalCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas to actual image size (not scaled)
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    
    // Draw at actual size
    ctx.drawImage(currentImage, 0, 0);
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function processImage() {
    showProcessing();
    
    setTimeout(() => {
        const resultCanvas = document.getElementById('resultCanvas');
        const ctx = resultCanvas.getContext('2d');
        
        // Set result canvas to actual image size
        resultCanvas.width = currentImage.width;
        resultCanvas.height = currentImage.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
        
        // Draw image at actual size
        ctx.drawImage(currentImage, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, resultCanvas.width, resultCanvas.height);
        
        // Apply selected algorithm
        let processedData;
        if (currentMode === 'manual') {
            processedData = removeBackgroundManual(imageData);
        } else {
            processedData = removeBackgroundAuto(imageData);
        }
        
        // Apply post-processing
        if (document.getElementById('smoothEdges')?.checked) {
            smoothAlphaMask(processedData);
        }
        
        if (document.getElementById('despeckle')?.checked) {
            despeckle(processedData);
        }
        
        // Apply feathering
        const featherAmount = parseInt(document.getElementById('featherSlider').value);
        if (featherAmount > 0) {
            featherEdges(processedData, featherAmount);
        }
        
        ctx.putImageData(processedData, 0, 0);
        
        updatePixelsRemovedStat(processedData);
        hideProcessing();
    }, 50);
}

function removeBackgroundAuto(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const sensitivity = parseFloat(document.getElementById('sensitivitySlider').value);
    
    // Detect background color from corners
    const bgColor = detectBackgroundColor(data, width, height);
    
    // Create alpha mask
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const distance = colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b);
        const threshold = sensitivity * 441.67; // Max possible distance
        
        if (distance < threshold) {
            data[i + 3] = 0;
        }
    }
    
    return imageData;
}

function removeBackgroundManual(imageData) {
    const data = imageData.data;
    const tolerance = parseInt(document.getElementById('toleranceSlider').value) * 2.55;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const distance = colorDistance(r, g, b, selectedColor.r, selectedColor.g, selectedColor.b);
        
        if (distance < tolerance) {
            data[i + 3] = 0;
        }
    }
    
    return imageData;
}

function detectBackgroundColor(data, width, height) {
    const samples = [];
    const sampleSize = Math.min(20, width / 10, height / 10);
    
    // Sample from corners
    const corners = [
        { x: 0, y: 0 }, // Top-left
        { x: width - sampleSize, y: 0 }, // Top-right
        { x: 0, y: height - sampleSize }, // Bottom-left
        { x: width - sampleSize, y: height - sampleSize } // Bottom-right
    ];
    
    corners.forEach(corner => {
        for (let y = corner.y; y < corner.y + sampleSize; y++) {
            for (let x = corner.x; x < corner.x + sampleSize; x++) {
                const i = (y * width + x) * 4;
                samples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
            }
        }
    });
    
    // Find most common color
    const colorMap = {};
    samples.forEach(color => {
        const key = `${Math.round(color.r/10)*10},${Math.round(color.g/10)*10},${Math.round(color.b/10)*10}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
    });
    
    let maxCount = 0;
    let dominantColor = { r: 255, g: 255, b: 255 };
    
    Object.entries(colorMap).forEach(([key, count]) => {
        if (count > maxCount) {
            maxCount = count;
            const [r, g, b] = key.split(',').map(Number);
            dominantColor = { r, g, b };
        }
    });
    
    return dominantColor;
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

function smoothAlphaMask(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const radius = parseInt(document.getElementById('edgeSlider').value);
    
    if (radius === 0) return;
    
    const alpha = new Float32Array(width * height);
    const smoothed = new Float32Array(width * height);
    
    // Extract alpha channel
    for (let i = 0; i < data.length; i += 4) {
        alpha[i / 4] = data[i + 3];
    }
    
    // Apply Gaussian blur to alpha channel
    gaussianBlur(alpha, smoothed, width, height, radius);
    
    // Apply smoothed alpha back
    for (let i = 0; i < data.length; i += 4) {
        data[i + 3] = Math.round(smoothed[i / 4]);
    }
}

function gaussianBlur(input, output, width, height, radius) {
    const sigma = radius / 3;
    const kernel = createGaussianKernel(radius, sigma);
    
    // Horizontal pass
    const temp = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;
            let weightSum = 0;
            
            for (let i = -radius; i <= radius; i++) {
                const sampleX = Math.max(0, Math.min(width - 1, x + i));
                const weight = kernel[i + radius];
                sum += input[y * width + sampleX] * weight;
                weightSum += weight;
            }
            
            temp[y * width + x] = sum / weightSum;
        }
    }
    
    // Vertical pass
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;
            let weightSum = 0;
            
            for (let i = -radius; i <= radius; i++) {
                const sampleY = Math.max(0, Math.min(height - 1, y + i));
                const weight = kernel[i + radius];
                sum += temp[sampleY * width + x] * weight;
                weightSum += weight;
            }
            
            output[y * width + x] = sum / weightSum;
        }
    }
}

function createGaussianKernel(radius, sigma) {
    const kernel = new Float32Array(radius * 2 + 1);
    const twoSigmaSquare = 2 * sigma * sigma;
    let sum = 0;
    
    for (let i = -radius; i <= radius; i++) {
        const weight = Math.exp(-(i * i) / twoSigmaSquare);
        kernel[i + radius] = weight;
        sum += weight;
    }
    
    // Normalize
    for (let i = 0; i < kernel.length; i++) {
        kernel[i] /= sum;
    }
    
    return kernel;
}

function featherEdges(imageData, amount) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const alpha = data[i + 3];
            
            if (alpha > 0 && alpha < 255) {
                // Find distance to nearest fully transparent pixel
                let minDist = amount;
                
                for (let dy = -amount; dy <= amount; dy++) {
                    for (let dx = -amount; dx <= amount; dx++) {
                        const ny = y + dy;
                        const nx = x + dx;
                        
                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                            const ni = (ny * width + nx) * 4;
                            if (data[ni + 3] === 0) {
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                minDist = Math.min(minDist, dist);
                            }
                        }
                    }
                }
                
                // Apply feathering based on distance
                const featherAlpha = Math.min(255, alpha * (minDist / amount));
                data[i + 3] = Math.round(featherAlpha);
            }
        }
    }
}

function despeckle(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const minSize = 10; // Minimum island size to keep
    
    // Find connected components
    const labels = new Int32Array(width * height);
    let nextLabel = 1;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            if (data[i + 3] > 128 && labels[y * width + x] === 0) {
                const size = floodFill(data, labels, width, height, x, y, nextLabel);
                if (size < minSize) {
                    // Remove small island
                    removeComponent(data, labels, width, height, nextLabel);
                }
                nextLabel++;
            }
        }
    }
}

function floodFill(data, labels, width, height, startX, startY, label) {
    const stack = [[startX, startY]];
    let size = 0;
    
    while (stack.length > 0) {
        const [x, y] = stack.pop();
        
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const idx = y * width + x;
        const i = idx * 4;
        
        if (data[i + 3] > 128 && labels[idx] === 0) {
            labels[idx] = label;
            size++;
            
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }
    
    return size;
}

function removeComponent(data, labels, width, height, label) {
    for (let i = 0; i < labels.length; i++) {
        if (labels[i] === label) {
            data[i * 4 + 3] = 0;
        }
    }
}

function handleCanvasClick(e) {
    if (currentMode !== 'manual') return;
    
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    
    selectedColor = { r: pixel[0], g: pixel[1], b: pixel[2] };
    const hex = rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b);
    
    document.getElementById('colorPreview').style.background = hex;
    document.getElementById('colorPicker').value = hex;
    
    processImage();
}

function switchMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    document.getElementById('autoControls').style.display = mode === 'auto' ? 'block' : 'none';
    document.getElementById('manualControls').style.display = mode === 'manual' ? 'block' : 'none';
    document.getElementById('advancedControls').style.display = mode === 'advanced' ? 'block' : 'none';
    
    if (currentImage) processImage();
}

function updateSliderValue(name, value) {
    const displays = {
        sensitivity: value,
        edge: value,
        feather: value + 'px',
        tolerance: value + '%'
    };
    
    document.getElementById(name + 'Value').textContent = displays[name];
}

function updateStats(file) {
    document.getElementById('imageSizeStat').textContent = 
        `${currentImage.width} × ${currentImage.height}`;
    
    const fileSize = file.size;
    const fileSizeStr = fileSize < 1024 * 1024 
        ? `${(fileSize / 1024).toFixed(1)} KB`
        : `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
    document.getElementById('fileSizeStat').textContent = fileSizeStr;
    
    const processingTime = Date.now() - processingStartTime;
    document.getElementById('processingTimeStat').textContent = `${processingTime}ms`;
}

function updatePixelsRemovedStat(imageData) {
    const data = imageData.data;
    let removedCount = 0;
    
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) removedCount++;
    }
    
    const totalPixels = imageData.width * imageData.height;
    const percentage = ((removedCount / totalPixels) * 100).toFixed(1);
    document.getElementById('pixelsRemovedStat').textContent = `${percentage}%`;
}

function downloadImage() {
    const canvas = document.getElementById('resultCanvas');
    const link = document.createElement('a');
    link.download = 'background-removed.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function resetImage() {
    if (!currentImage) return;
    
    // Reset all sliders to default
    document.getElementById('sensitivitySlider').value = 0.3;
    document.getElementById('edgeSlider').value = 3;
    document.getElementById('featherSlider').value = 2;
    document.getElementById('toleranceSlider').value = 30;
    
    // Update displays
    updateSliderValue('sensitivity', 0.3);
    updateSliderValue('edge', 3);
    updateSliderValue('feather', 2);
    updateSliderValue('tolerance', 30);
    
    processImage();
}

function compareToggle() {
    const resultCanvas = document.getElementById('resultCanvas');
    const ctx = resultCanvas.getContext('2d');
    
    if (isComparing) {
        processImage();
    } else {
        // Set canvas to actual size before drawing
        resultCanvas.width = currentImage.width;
        resultCanvas.height = currentImage.height;
        ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
        ctx.drawImage(currentImage, 0, 0);
    }
    
    isComparing = !isComparing;
}

function uploadNew() {
    document.getElementById('fileInput').click();
}

function showProcessing() {
    document.getElementById('processingIndicator').style.display = 'block';
}

function hideProcessing() {
    document.getElementById('processingIndicator').style.display = 'none';
}

// Utility functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}