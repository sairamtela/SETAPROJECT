const keywords = [
    "Product name", "Colour", "Motor type", "Frequency", "Gross weight", "Ratio",
    "Motor Frame", "Model", "Speed", "Quantity", "Voltage", "Material", "Type",
    "Horse power", "Consinee", "LOT", "Stage", "Outlet", "Serial number", "Head Size",
    "Delivery size", "Phase", "Size", "MRP", "Use before", "Height",
    "Maximum Discharge Flow", "Discharge Range", "Assembled by", "Manufacture date",
    "Company name", "Customer care number", "Seller Address", "Seller email", "GSTIN",
    "Total amount", "Payment status", "Payment method", "Invoice date", "Warranty",
    "Brand", "Motor horsepower", "Power", "Motor phase", "Engine type", "Tank capacity",
    "Head", "Usage/Application", "Weight", "Volts", "Hertz", "Frame", "Mounting", "Toll free number",
    "Pipesize", "Manufacturer", "Office", "Size", "Ratio", "SR number", "volts", "weight", "RPM",
    "frame"
];

let currentFacingMode = "environment";
let stream = null;
let extractedData = {};
let allData = [];

// Elements
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const outputDiv = document.getElementById('outputAttributes');
const flipButton = document.getElementById('flipButton');
const captureButton = document.getElementById('captureButton');
const exportButton = document.getElementById('exportButton');
const exportExcelButton = document.getElementById('exportExcelButton');

// Initialize Camera
async function startCamera() {
    try {
        // Stop any active streams
        if (stream) stream.getTracks().forEach(track => track.stop());

        // Start the camera
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode, width: 1280, height: 720 }
        });
        video.srcObject = stream;
        video.play();
        console.log("Camera started successfully.");
    } catch (err) {
        console.error("Camera access error:", err);
        alert("Unable to access the camera. Check your permissions and try again.");
    }
}

// Flip Camera
flipButton.addEventListener('click', () => {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    startCamera();
});

// Capture Image
captureButton.addEventListener('click', () => {
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

    // Map keywords to extracted text
    keywords.forEach(keyword => {
        for (let line of lines) {
            if (line.includes(keyword)) {
                const value = line.split(":")[1]?.trim() || "-";
                if (value !== "-") {
                    extractedData[keyword] = value;
                }
                break;
            }
        }
    });

    // Capture unmatched text as "Other Specifications"
    lines.forEach(line => {
        if (!Object.values(extractedData).some(value => line.includes(value))) {
            remainingText.push(line.trim());
        }
    });

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
exportButton.addEventListener('click', async () => {
    if (!Object.keys(extractedData).length) {
        alert("No data to export. Capture an image first.");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/export_to_salesforce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ extractedData })
        });

        const result = await response.json();
        if (response.ok) {
            alert(`Record created in Salesforce. Record ID: ${result.record_id}`);
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error("Export Error:", error);
        alert("Failed to export data to Salesforce.");
    }
});

// Export to Excel
exportExcelButton.addEventListener('click', () => {
    if (!allData.length) {
        alert("No data to export to Excel. Capture an image first.");
        return;
    }

    const workbook = XLSX.utils.book_new();
    const headers = Object.keys(extractedData);
    const data = allData.map(row => headers.map(key => row[key] || "-"));
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
    XLSX.writeFile(workbook, "Camera_Extracted_Data.xlsx");
});

// Start Camera on Load
startCamera();
