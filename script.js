const BACKEND_URL = "http://127.0.0.1:5000/api/push";

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

let extractedData = {};
let currentFacingMode = "environment"; // Default camera mode

// Start the camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode }
        });
        document.getElementById("camera").srcObject = stream;
    } catch (error) {
        alert("Error accessing the camera. Please allow camera access.");
        console.error("Camera error:", error);
    }
}

// Flip the camera between front and back
document.getElementById("flipButton").addEventListener("click", () => {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    startCamera();
});

// Capture an image and process it
document.getElementById("captureButton").addEventListener("click", async () => {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => processImage(img);
});

// Use Tesseract.js to process the captured image and extract text
async function processImage(img) {
    try {
        const result = await Tesseract.recognize(img, "eng");
        mapExtractedData(result.data.text);
    } catch (error) {
        alert("Error processing the image. Please try again.");
        console.error("Image processing error:", error);
    }
}

// Map extracted text to predefined keywords
function mapExtractedData(text) {
    const lines = text.split("\n");
    extractedData = {};
    let remainingText = [];

    // Match lines to keywords
    keywords.forEach(keyword => {
        lines.forEach((line, index) => {
            const regex = new RegExp(`${keyword}\\s*[:\\-]?\\s*(.+)`, "i");
            const match = line.match(regex);
            if (match && match[1]) {
                extractedData[keyword] = match[1].trim();
                lines[index] = ""; // Mark line as processed
            }
        });
    });

    // Remaining unmatched text goes into Other Specifications
    remainingText = lines.filter(line => line.trim() !== "");
    extractedData["Other Specifications"] = remainingText.join(" ");

    // Display the extracted data
    displayExtractedData();

    // Send the data to the backend
    sendDataToBackend();
}

// Display extracted data on the frontend
function displayExtractedData() {
    const outputDiv = document.getElementById("outputAttributes");
    outputDiv.innerHTML = ""; // Clear previous data
    Object.entries(extractedData).forEach(([key, value]) => {
        outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
    });
}

// Send the extracted data to the backend Flask API
async function sendDataToBackend() {
    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(extractedData)
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
        } else {
            alert(`Backend error: ${result.error}`);
        }
    } catch (error) {
        alert("Failed to connect to the backend. Please try again.");
        console.error("Backend connection error:", error);
    }
}

// Initialize the camera when the page loads
document.addEventListener("DOMContentLoaded", startCamera);
