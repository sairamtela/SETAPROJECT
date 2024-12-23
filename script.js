const keywords = [
    "Power", "Power Source", "Engine Type", "Motor Phase", "Voltage", "Frequency",
    "Material", "Motor Speed", "Cooling Method", "Model"
];

let extractedData = {};
let currentFacingMode = "environment";

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
        document.getElementById("loader").style.display = "block";
        const result = await Tesseract.recognize(img, "eng", {
            logger: m => console.log(m),
            tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/ ",
            preserve_interword_spaces: true
        });
        console.log("Raw OCR Output:", result.data.text); // Log raw text for debugging
        mapExtractedData(result.data.text);
    } catch (error) {
        alert("Error processing the image. Please try again.");
        console.error("Image processing error:", error);
    } finally {
        document.getElementById("loader").style.display = "none";
    }
}

// Map extracted text to predefined keywords
function mapExtractedData(text) {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line);
    extractedData = {};

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

    // Display the extracted data
    displayExtractedData();
}

// Display only attributes with values
function displayExtractedData() {
    const outputDiv = document.getElementById("outputAttributes");
    outputDiv.innerHTML = ""; // Clear previous data

    if (Object.keys(extractedData).length === 0) {
        outputDiv.innerHTML = "<p>No data yet...</p>";
        return;
    }

    Object.entries(extractedData).forEach(([key, value]) => {
        if (value) {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });

    console.log("Extracted Data:", extractedData); // Log the extracted data
}

// Start Camera on Page Load
startCamera();
