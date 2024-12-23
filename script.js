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
        handleCameraError(err);
    }
}

// Handle Camera Errors
function handleCameraError(err) {
    const errorMessages = {
        NotAllowedError: "Camera access denied. Please allow camera access in your browser settings.",
        NotFoundError: "No camera device found. Connect a camera and try again.",
        OverconstrainedError: "The requested camera constraints could not be satisfied. Check your device settings."
    };
    alert(errorMessages[err.name] || "An unknown error occurred while accessing the camera.");
    console.error("Camera error:", err);
}

// Flip Camera
document.getElementById('flipButton').addEventListener('click', () => {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    startCamera();
});

// Capture Image and Pre-process
document.getElementById('captureButton').addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Enhance the captured image
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    preprocessImage(context, imageData);

    const imgDataURL = canvas.toDataURL("image/png");
    processImage(imgDataURL);
});

// Preprocess Image (Grayscale, Brightness, Contrast)
function preprocessImage(context, imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const grayscale = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
        data[i] = data[i + 1] = data[i + 2] = grayscale; // Convert to grayscale
        data[i] = Math.min(data[i] * 1.2, 255); // Brightness
    }
    context.putImageData(imageData, 0, 0);
}

// Process Image with Tesseract.js
async function processImage(imageDataURL) {
    try {
        outputDiv.innerHTML = "<p>Processing...</p>";

        const result = await Tesseract.recognize(imageDataURL, 'eng', {
            logger: m => console.log(m),
            tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/ "
        });

        if (result && result.data.text) {
            processTextToAttributes(result.data.text);
        } else {
            outputDiv.innerHTML = "<p>No text detected. Please try again.</p>";
        }
    } catch (error) {
        alert("Error processing the image. Please try again.");
        console.error("Tesseract.js Error:", error);
    }
}

// Map Extracted Text to Keywords
function processTextToAttributes(text) {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line);
    extractedData = {};
    const otherSpecifications = [];

    keywords.forEach(keyword => {
        for (let line of lines) {
            if (line.toLowerCase().includes(keyword.toLowerCase())) {
                const value = line.split(/[:\-]/)[1]?.trim() || "-";
                if (value !== "-") {
                    extractedData[keyword] = value;
                }
                break;
            }
        }
    });

    // Capture unmatched lines
    lines.forEach(line => {
        if (!Object.values(extractedData).some(value => line.includes(value))) {
            otherSpecifications.push(line);
        }
    });

    extractedData["Other Specifications"] = otherSpecifications.join(" ");
    displayData();
}

// Display Extracted Data
function displayData() {
    outputDiv.innerHTML = "";
    Object.entries(extractedData).forEach(([key, value]) => {
        if (value && value !== "-") {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });
}

// Start Camera on Load
startCamera();
