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
    "Pipesize", "Manufacturer", "Office", "Ratio", "SR number", "RPM", "Frame",
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
            video: { facingMode: currentFacingMode }
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.play();
    } catch (err) {
        handleCameraError(err);
    }
}

// Handle Camera Errors
function handleCameraError(err) {
    if (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError") {
        alert("The selected camera mode is not supported on this device.");
    } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        alert("Camera access was denied. Please grant permissions to continue.");
    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        alert("No camera found. Please connect a camera and try again.");
    } else {
        alert("An unknown error occurred while accessing the camera.");
    }
    console.error("Camera Error:", err);
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

    const imageData = canvas.toDataURL("image/png");
    preprocessImage(imageData);
});

// Preprocess Image (Grayscale and Thresholding)
function preprocessImage(imageData) {
    const img = new Image();
    img.src = imageData;
    img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;

        // Convert to grayscale
        context.drawImage(img, 0, 0);
        const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // Red
            data[i + 1] = avg; // Green
            data[i + 2] = avg; // Blue
        }
        context.putImageData(imgData, 0, 0);

        // Apply OCR
        processImage(canvas.toDataURL());
    };
}

// Process Image with Tesseract.js
async function processImage(imageData) {
    outputDiv.innerHTML = "<p>Processing...</p>";
    try {
        const result = await Tesseract.recognize(imageData, 'eng', {
            logger: m => console.log(m),
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:-., "
        });
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

// Map Extracted Text to Keywords
function processTextToAttributes(text) {
    const lines = text.split("\n").filter(line => line.trim() !== "");
    extractedData = {};

    // Extract data using keyword matching
    keywords.forEach(keyword => {
        for (let line of lines) {
            if (line.toLowerCase().includes(keyword.toLowerCase())) {
                const value = line.split(":")[1]?.trim() || "-";
                if (value !== "-") {
                    extractedData[keyword] = value;
                }
                break;
            }
        }
    });

    allData.push(extractedData);
    displayData();
}

// Display Data
function displayData() {
    outputDiv.innerHTML = "";
    Object.entries(extractedData).forEach(([key, value]) => {
        if (value) {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });
}

// Export to Excel
document.getElementById('exportButton').addEventListener('click', () => {
    const workbook = XLSX.utils.book_new();
    const headers = keywords;
    const data = allData.map(row => headers.map(key => row[key] || "-"));
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
    XLSX.writeFile(workbook, "Extracted_Data.xlsx");
});

// Start Camera on Load
startCamera();
