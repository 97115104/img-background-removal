let originalImageData = null;
        let currentImage = null;

        // Setup drag and drop
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const previewContainer = document.getElementById('previewContainer');
        const status = document.getElementById('status');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        // Slider controls
        const thresholdSlider = document.getElementById('thresholdSlider');
        const smoothingSlider = document.getElementById('smoothingSlider');
        
        thresholdSlider.addEventListener('input', (e) => {
            document.getElementById('thresholdValue').textContent = e.target.value;
            if (currentImage) {
                processImage();
            }
        });

        smoothingSlider.addEventListener('input', (e) => {
            document.getElementById('smoothingValue').textContent = e.target.value;
            if (currentImage) {
                processImage();
            }
        });

        function handleFile(file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            status.textContent = 'Processing image...';
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    currentImage = img;
                    displayOriginal();
                    processImage();
                    previewContainer.style.display = 'block';
                    status.textContent = 'Image loaded. Adjust settings as needed.';
                };
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        }

        function displayOriginal() {
            const canvas = document.getElementById('originalCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            ctx.drawImage(currentImage, 0, 0);
            
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        function processImage() {
            const resultCanvas = document.getElementById('resultCanvas');
            const ctx = resultCanvas.getContext('2d');
            
            resultCanvas.width = currentImage.width;
            resultCanvas.height = currentImage.height;
            
            // Clear canvas
            ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
            
            // Get image data
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = currentImage.width;
            tempCanvas.height = currentImage.height;
            tempCtx.drawImage(currentImage, 0, 0);
            
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;
            
            // Simple background removal algorithm
            const threshold = parseFloat(thresholdSlider.value);
            const smoothing = parseInt(smoothingSlider.value);
            
            // Detect background color (assuming it's relatively uniform)
            const bgColor = detectBackgroundColor(data, imageData.width, imageData.height);
            
            // Create alpha mask
            const alphaMask = new Uint8Array(imageData.width * imageData.height);
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                const distance = colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b);
                const pixelIndex = i / 4;
                
                if (distance < threshold * 255) {
                    alphaMask[pixelIndex] = 0;
                } else {
                    alphaMask[pixelIndex] = 255;
                }
            }
            
            // Apply smoothing
            if (smoothing > 0) {
                smoothAlphaMask(alphaMask, imageData.width, imageData.height, smoothing);
            }
            
            // Apply alpha mask to image
            for (let i = 0; i < data.length; i += 4) {
                data[i + 3] = alphaMask[i / 4];
            }
            
            ctx.putImageData(imageData, 0, 0);
        }

        function detectBackgroundColor(data, width, height) {
            // Sample colors from corners and edges
            const samples = [];
            const sampleSize = 10;
            
            // Top-left corner
            for (let y = 0; y < sampleSize; y++) {
                for (let x = 0; x < sampleSize; x++) {
                    const i = (y * width + x) * 4;
                    samples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
                }
            }
            
            // Find most common color range
            let r = 0, g = 0, b = 0;
            samples.forEach(sample => {
                r += sample.r;
                g += sample.g;
                b += sample.b;
            });
            
            return {
                r: Math.round(r / samples.length),
                g: Math.round(g / samples.length),
                b: Math.round(b / samples.length)
            };
        }

        function colorDistance(r1, g1, b1, r2, g2, b2) {
            const dr = r1 - r2;
            const dg = g1 - g2;
            const db = b1 - b2;
            return Math.sqrt(dr * dr + dg * dg + db * db);
        }

        function smoothAlphaMask(mask, width, height, radius) {
            const temp = new Uint8Array(mask.length);
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let sum = 0;
                    let count = 0;
                    
                    for (let dy = -radius; dy <= radius; dy++) {
                        for (let dx = -radius; dx <= radius; dx++) {
                            const ny = y + dy;
                            const nx = x + dx;
                            
                            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                                sum += mask[ny * width + nx];
                                count++;
                            }
                        }
                    }
                    
                    temp[y * width + x] = Math.round(sum / count);
                }
            }
            
            mask.set(temp);
        }

        function downloadImage() {
            const canvas = document.getElementById('resultCanvas');
            const link = document.createElement('a');
            link.download = 'background-removed.png';
            link.href = canvas.toDataURL();
            link.click();
        }