// Elements
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const outputDiv = document.getElementById('outputAttributes');

let currentFacingMode = "environment";
let stream = null;
let extractedData = {}; // Store matched structured data
let otherSpecifications = []; // Store unmatched fields

// Define constant keywords for matching fields
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
    "Pipesize", "Manufacturer", "Office", "Size", "SR number", "RPM"
];

// Start Camera
async function startCamera() {
    try {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode }
        });
        video.srcObject = stream;
        video.play();
    } catch (err) {
        console.error("Error starting camera:", err);
        alert("Unable to access the camera. Please check your device or browser permissions.");
    }
}

// Flip Camera
document.getElementById('flipButton').addEventListener('click', () => {
    try {
        currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
        startCamera(); // Restart camera with new facing mode
    } catch (err) {
        console.error("Error flipping camera:", err);
        alert("Camera flip failed. Ensure your device supports front and back cameras.");
    }
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
        const result = await Tesseract.recognize(img, 'eng', {
            logger: m => console.log(m),
            tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/ ",
            preserve_interword_spaces: true
        });
        if (result && result.data.text) {
            console.log("OCR Result:", result.data.text);
            mapStructuredData(result.data.text);
        } else {
            outputDiv.innerHTML = "<p>No text detected. Please try again.</p>";
        }
    } catch (error) {
        console.error("Tesseract.js Error:", error);
        outputDiv.innerHTML = "<p>Error processing image. Please try again.</p>";
    }
}

// Map OCR Output to Structured Data Using Keywords
function mapStructuredData(text) {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line);
    extractedData = {}; // Reset for new data
    otherSpecifications = []; // Reset unmatched fields

    lines.forEach(line => {
        let matched = false;

        keywords.forEach(keyword => {
            const regex = new RegExp(`^${keyword}\\s*[:\\-]?`, "i"); // Match keyword with optional separators
            if (regex.test(line)) {
                const value = line.replace(regex, "").trim(); // Remove the keyword and separator
                if (value) {
                    extractedData[keyword] = value;
                    matched = true;
                }
            }
        });

        if (!matched) {
            // If no keyword matches, add the line to Other Specifications
            otherSpecifications.push(line);
        }
    });

    // Add Other Specifications if there are unmatched lines
    if (otherSpecifications.length > 0) {
        extractedData["Other Specifications"] = otherSpecifications.join(", ");
    }

    displayData();
}

// Display Extracted Data
function displayData() {
    if (Object.keys(extractedData).length === 0) {
        outputDiv.innerHTML = "<p>No relevant data found. Please try again.</p>";
    } else {
        outputDiv.innerHTML = `<p><strong>Extracted Data:</strong></p>`;
        Object.entries(extractedData).forEach(([key, value]) => {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        });
        console.log("Structured Extracted Data:", extractedData); // Log data for backend usage
    }
}

// Start Camera on Page Load
startCamera();
