// Keywords for data extraction
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

// Start Camera
async function startCamera() {
    try {
        if (stream) stream.getTracks().forEach(track => track.stop());
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode, width: 1280, height: 720 }
        });
        video.srcObject = stream;
        video.play();
    } catch (err) {
        alert("Camera access denied or unavailable.");
        console.error(err);
    }
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

// Map Extracted Text to Keywords
function processTextToAttributes(text) {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line);
    extractedData = {};

    if (lines.length > 0) {
        // Set the first line as "Product Name"
        extractedData["Product Name"] = lines[0];
    }

    const otherSpecifications = [];

    keywords.forEach(keyword => {
        for (let line of lines.slice(1)) { // Exclude the first line
            if (line.includes(keyword)) {
                const value = line.split(":")[1]?.trim() || "-";
                if (value !== "-") {
                    extractedData[keyword] = value;
                }
                break;
            }
        }
    });

    // Add unclassified text to "Other Specifications"
    lines.slice(1).forEach(line => {
        const isClassified = keywords.some(keyword => line.includes(keyword));
        if (!isClassified) {
            otherSpecifications.push(line);
        }
    });

    if (otherSpecifications.length > 0) {
        extractedData["Other Specifications"] = otherSpecifications.join(", ");
    }

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

// Export to Salesforce
document.getElementById('exportButton').addEventListener('click', async () => {
    if (Object.keys(extractedData).length === 0) {
        alert("No extracted data available to export. Please process an image first.");
        return;
    }

    // Sanitize and prepare the data for export
    const sanitizedData = {};
    for (const [key, value] of Object.entries(extractedData)) {
        if (Array.isArray(value)) {
            sanitizedData[key] = value.join(", "); // Convert array to a string
        } else if (value !== undefined && value !== null) {
            sanitizedData[key] = value.toString(); // Ensure string format
        } else {
            sanitizedData[key] = ""; // Handle null or undefined values
        }
    }

    console.log("Sanitized Data to be sent:", sanitizedData);

    try {
        const response = await fetch('http://127.0.0.1:5000/export_to_salesforce', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: sanitizedData }), // Wrap data under a "data" key
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Record created successfully in Salesforce. Record ID: ${result.record_id}`);
        } else {
            const errorDetails = await response.json();
            console.error("Salesforce Error Response:", errorDetails);
            alert(`Error creating record in Salesforce: ${errorDetails.message || errorDetails.error}`);
        }
    } catch (error) {
        console.error("Error exporting data to Salesforce:", error);
        alert("Error exporting data to Salesforce. Check console for details.");
    }
});

// Start Camera on Load
startCamera();
