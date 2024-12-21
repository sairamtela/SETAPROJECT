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

let extractedData = {};

// Start Camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: 1280, height: 720 }
        });
        document.getElementById("camera").srcObject = stream;
    } catch (err) {
        alert("Camera access denied.");
        console.error(err);
    }
}

// Capture Image
document.getElementById("captureButton").addEventListener("click", () => {
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

// Process Image with Tesseract.js
async function processImage(img) {
    document.getElementById("outputAttributes").innerHTML = "<p>Processing...</p>";
    try {
        const result = await Tesseract.recognize(img, "eng", { logger: (m) => console.log(m) });
        if (result && result.data.text) {
            console.log("OCR Result:", result.data.text);
            processTextToAttributes(result.data.text);
        } else {
            document.getElementById("outputAttributes").innerHTML = "<p>No text detected.</p>";
        }
    } catch (error) {
        console.error("OCR Error:", error);
    }
}

// Map Extracted Text to Keywords
function processTextToAttributes(text) {
    const lines = text.split("\n");
    extractedData = {};

    keywords.forEach((keyword) => {
        lines.forEach((line) => {
            const regex = new RegExp(`${keyword}\\s*[:\\-]?\\s*(.+)`, "i");
            const match = line.match(regex);
            if (match && match[1]) {
                extractedData[keyword] = match[1].trim();
            }
        });
    });

    displayData(extractedData);
    sendDataToSalesforce(extractedData);
}

// Display Extracted Data
function displayData(data) {
    const outputDiv = document.getElementById("outputAttributes");
    outputDiv.innerHTML = "";
    Object.entries(data).forEach(([key, value]) => {
        outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
    });
}

// Send Data to Flask API
async function sendDataToSalesforce(data) {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Data pushed to Salesforce successfully.");
            console.log("Salesforce Response:", result);
        } else {
            console.error("Error from Salesforce:", result.error);
            alert(`Error pushing data to Salesforce: ${result.error}`);
        }
    } catch (error) {
        console.error("Error sending data to Salesforce:", error);
        alert("Failed to send data to Salesforce.");
    }
}

// Start Camera on Load
startCamera();
