const keywords = [
    "Product name", "Voltage", "Phase", "Brand", "Power", "Other Specifications"
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
    const lines = text.split("\n");
    extractedData = {};
    let remainingText = [];

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

    // Add remaining text as "Other Specifications"
    extractedData["Other Specifications"] = lines.join(" ");
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
document.getElementById('exportButton').addEventListener('click', async () => {
    if (Object.keys(extractedData).length === 0) {
        alert("No extracted data available to export. Please process an image first.");
        return;
    }

    console.log("Exporting Data to Salesforce:", extractedData);  // Debugging

    try {
        const response = await fetch('https://<your-ngrok-url>/export_to_salesforce', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ extractedData }),
        });

        const result = await response.json();
        console.log("Backend Response:", result);  // Debugging

        if (response.ok) {
            alert(`Record created successfully in Salesforce. Record ID: ${result.record_id}`);
        } else {
            alert(`Error creating record in Salesforce: ${result.error}`);
        }
    } catch (error) {
        console.error("Error exporting data to Salesforce:", error);
        alert("Error exporting data to Salesforce. Check console for details.");
    }
});

// Start Camera on Load
startCamera();
