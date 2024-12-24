// Keywords for data extraction
const keywords = [
    "Product name", "Colour", "Motor type", "Frequency", "Gross weight", "Ratio",
    "Motor Frame", "Model", "Speed", "Quantity", "Voltage", "Material", "Type",
    "Horse power", "Consignee", "LOT", "Stage", "Outlet", "Serial number", "Head Size",
    "Delivery size", "Phase", "Size", "MRP", "Use before", "Height",
    "Maximum Discharge Flow", "Discharge Range", "Assembled by", "Manufacture date",
    "Company name", "Customer care number", "Seller Address", "Seller email", "GSTIN",
    "Total amount", "Payment status", "Payment method", "Invoice date", "Warranty", 
    "Brand", "Motor horsepower", "Power", "Motor phase", "Engine type", "Tank capacity",
    "Head", "Usage/Application", "Weight", "Volts", "Hertz", "Frame", "Mounting", "Toll free number",
    "Pipesize", "Manufacturer", "Office", "SR number", "RPM"
];

let currentFacingMode = "environment";
let stream = null;
let extractedData = {};
let allData = [];

// Elements
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const outputDiv = document.getElementById('outputAttributes');

// Start Camera
async function startCamera() {
    try {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: { facingMode: currentFacingMode, width: 1280, height: 720 }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints).catch(err => {
            console.warn("Facing mode unsupported. Trying default video device.", err);
            return navigator.mediaDevices.getUserMedia({ video: true });
        });

        video.srcObject = stream;
        video.play();
    } catch (err) {
        console.error("Failed to start camera:", err);
        handleCameraError(err);
    }
}

// Handle Camera Errors
function handleCameraError(err) {
    if (err.name === "NotAllowedError") {
        alert("Camera access denied. Please allow camera access in your browser settings.");
    } else if (err.name === "NotFoundError") {
        alert("No camera device found. Connect a camera and try again.");
    } else if (err.name === "OverconstrainedError") {
        alert("The requested camera constraints could not be satisfied. Check your device settings.");
    } else {
        alert("An unknown error occurred while accessing the camera.");
    }
    console.error("Camera error:", err);
}

// Flip Camera
document.getElementById('flipButton').addEventListener('click', () => {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    startCamera();
});

// Capture Image
document.getElementById('captureButton').addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => processImage(img);
    }, 'image/png');
});

// Process Image with Preprocessing
async function processImage(img) {
    outputDiv.innerHTML = "<p>Processing...</p>";
    try {
        // Step 1: Create an off-screen canvas for preprocessing
        const offscreenCanvas = document.createElement('canvas');
        const context = offscreenCanvas.getContext('2d');
        offscreenCanvas.width = img.width;
        offscreenCanvas.height = img.height;
        context.drawImage(img, 0, 0);

        // Step 2: Image Preprocessing (Binarization and Noise Removal)
        const imageData = context.getImageData(0, 0, img.width, img.height);
        const processedData = preprocessImage(imageData);
        context.putImageData(processedData, 0, 0);

        // Step 3: Pass the preprocessed image to Tesseract.js
        const blob = await new Promise(resolve => offscreenCanvas.toBlob(resolve, 'image/png'));
        const result = await Tesseract.recognize(blob, 'eng', { logger: m => console.log(m) });

        if (result && result.data.text) {
            console.log("OCR Result:", result.data.text);
            processTextToAttributes(result.data.text);
        } else {
            outputDiv.innerHTML = "<p>No text detected. Please try again.</p>";
        }
    } catch (error) {
        console.error("Tesseract.js Error:", error);
        outputDiv.innerHTML = "<p>Error processing image. Please try again.</p>";
    }
}

// Preprocess Image Data for OCR
function preprocessImage(imageData) {
    const { data, width, height } = imageData;

    // Apply binarization
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];     // Red
        const g = data[i + 1]; // Green
        const b = data[i + 2]; // Blue

        // Convert to grayscale
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Binarization (thresholding)
        const threshold = 128;
        const binarized = gray > threshold ? 255 : 0;

        // Set pixel to black or white
        data[i] = data[i + 1] = data[i + 2] = binarized;
        data[i + 3] = 255; // Full opacity
    }

    return new ImageData(data, width, height);
}

// Map Extracted Text to Keywords and Capture Remaining Text
function processTextToAttributes(text) {
    const lines = text.split("\n");
    extractedData = {};
    let remainingText = [];

    keywords.forEach(keyword => {
        for (let line of lines) {
            if (line.includes(keyword)) {
                const value = line.split(":"[1]?.trim() || "-");
                if (value !== "-") {
                    extractedData[keyword] = value;
                }
                break;
            }
        }
    });

    // Capture remaining text that is not matched with keywords
    lines.forEach(line => {
        if (!Object.values(extractedData).some(value => line.includes(value))) {
            remainingText.push(line.trim());
        }
    });

    // Add remaining text as "Other Specifications"
    extractedData["Other Specifications"] = remainingText.join(" ");

    allData.push(extractedData);
    displayData();
}

// Display Extracted Data
function displayData() {
    outputDiv.innerHTML = "";
    Object.entries(extractedData).forEach(([key, value]) => {
        if (value) {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });
}

// Export to Salesforce
document.getElementById('exportButton').addEventListener('click', async () => {
    if (Object.keys(extractedData).length === 0) {
        alert("No extracted data available to export. Please process an image first.");
        return;
    }

    const sanitizedData = {};
    for (const [key, value] of Object.entries(extractedData)) {
        if (Array.isArray(value)) {
            sanitizedData[key] = value.join(", ");
        } else if (value !== undefined && value !== null) {
            sanitizedData[key] = value.toString();
        } else {
            sanitizedData[key] = "";
        }
    }

    try {
        console.log("Exporting Data to Salesforce:", sanitizedData);
        const response = await fetch('http://127.0.0.1:5000/export_to_salesforce', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sanitizedData),
        });

        const result = await response.json();
        if (response.ok) {
            alert(`Record created successfully in Salesforce. Record ID: ${result.record_id}`);
        } else {
            alert(`Error creating record in Salesforce: ${result.error}`);
        }
    } catch (error) {
        console.error("Error exporting data to Salesforce:", error);
        alert("Error exporting data to Salesforce. Check console for details.");
    }
});

// Start Camera on Load
startCamera();
