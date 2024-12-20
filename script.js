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
    "frame", 
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

// Capture Image and Extract Product Name
document.getElementById('captureButton').addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Crop the bottom section of the image
    const croppedCanvas = document.createElement("canvas");
    const croppedContext = croppedCanvas.getContext("2d");
    const cropHeight = Math.floor(canvas.height * 0.2); // Bottom 20% of the image
    croppedCanvas.width = canvas.width;
    croppedCanvas.height = cropHeight;

    croppedContext.drawImage(canvas, 0, canvas.height - cropHeight, canvas.width, cropHeight, 0, 0, canvas.width, cropHeight);

    croppedCanvas.toBlob(blob => {
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
            extractProductName(result.data.text);
        } else {
            outputDiv.innerHTML = "<p>No text detected. Please try again.</p>";
        }
    } catch (error) {
        console.error("Tesseract.js Error:", error);
        outputDiv.innerHTML = "<p>Error processing image. Please try again.</p>";
    }
}

// Extract Product Name
function extractProductName(text) {
    const lines = text.split("\n").filter(line => line.trim() !== "");
    const productName = lines.find(line => line.toLowerCase().includes("product name")) || lines[0];
    extractedData["Product Name"] = productName.trim();

    // Display Extracted Product Name
    outputDiv.innerHTML = `<p><strong>Product Name:</strong> ${extractedData["Product Name"]}</p>`;
}

// Export to Excel
function saveToExcel(filename) {
    const workbook = XLSX.utils.book_new();
    const headers = ["Product Name", ...keywords.filter(k => k !== "Product Name")];
    const data = allData.map(row => headers.map(key => row[key] || "-"));
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
    XLSX.writeFile(workbook, filename);
}

// Add Event Listeners for Save and Download Buttons
document.getElementById('saveButton').addEventListener('click', () => {
    saveToExcel("Saved_Data.xlsx");
});

document.getElementById('downloadButton').addEventListener('click', () => {
    saveToExcel("Downloaded_Data.xlsx");
});

// Start Camera on Load
startCamera();
