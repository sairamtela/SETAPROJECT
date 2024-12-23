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

        console.log("Requested constraints:", constraints);

        // Attempt to get user media with facingMode
        stream = await navigator.mediaDevices.getUserMedia(constraints).catch(err => {
            console.warn("Facing mode unsupported. Trying default video device.", err);
            return navigator.mediaDevices.getUserMedia({ video: true });
        });

        console.log("Camera started successfully.");
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

// Process Image with Tesseract.js
async function processImage(img) {
    outputDiv.innerHTML = "<p>Processing...</p>";
    try {
        const result = await Tesseract.recognize(img, 'eng', { logger: m => console.log(m) });
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


// Export Data to Backend
document.getElementById('exportButton').addEventListener('click', async () => {
    if (Object.keys(extractedData).length === 0) {
        alert("No extracted data available to export. Please process an image first.");
        return;
    }

    const sanitizedData = {};
    for (const [key, value] of Object.entries(extractedData)) {
        sanitizedData[key] = value || "N/A";
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sanitizedData),
        });

        const result = await response.json();
        if (response.ok) {
            alert(`Data exported successfully! Salesforce Record ID: ${result.salesforce_id}`);
        } else {
            alert(`Error exporting data: ${result.error}`);
        }
    } catch (error) {
        console.error("Error connecting to backend:", error);
        alert("Failed to connect to backend. Check console for details.");
    }
});

// Start Camera on Load
startCamera();
