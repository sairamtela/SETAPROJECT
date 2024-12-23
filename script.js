// Elements
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const outputDiv = document.getElementById('outputAttributes');

let currentFacingMode = "environment";
let stream = null;
let extractedData = {}; // Store matched structured data
let otherSpecifications = []; // Store unmatched fields

// Define constant keywords for mapping fields
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

// Function to calculate similarity (Levenshtein distance)
function getSimilarity(a, b) {
    if (!a || !b) return 0;
    a = a.toLowerCase();
    b = b.toLowerCase();
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return 1 - matrix[a.length][b.length] / Math.max(a.length, b.length);
}

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

    const matchedAttributes = new Set();
    const otherSpecifications = [];

    // Process lines for attributes
    lines.slice(1).forEach(line => {
        let matched = false;
        for (let keyword of keywords) {
            if (line.toLowerCase().includes(keyword.toLowerCase())) {
                const value = line.split(/[:\-]/)[1]?.trim() || "-";
                if (value !== "-") {
                    extractedData[keyword] = value;
                    matchedAttributes.add(keyword);
                    matched = true;
                }
                break;
            }
        }
        if (!matched) {
            otherSpecifications.push(line);
        }
    });

    // Ensure all keywords are present with a value if available
    keywords.forEach(keyword => {
        if (!matchedAttributes.has(keyword)) {
            extractedData[keyword] = "-";
        }
    });

    // Add unclassified text to "Other Specifications"
    if (otherSpecifications.length > 0) {
        extractedData["Other Specifications"] = otherSpecifications.join(", ");
    }

    allData.push(extractedData);
    displayData();
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
