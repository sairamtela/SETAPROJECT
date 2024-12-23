const keywords = [
    "Product name", "Power", "Power Source", "Engine Type", "Motor Phase", "Voltage",
    "Frequency", "Material", "Motor Speed", "Other Specifications"
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

// Flip the camera
document.getElementById("flipButton").addEventListener("click", () => {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    startCamera();
});

// Capture and preprocess the image
document.getElementById("captureButton").addEventListener("click", async () => {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Preprocess the image (increase contrast and brightness)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * 1.2; // Red channel
        data[i + 1] = data[i + 1] * 1.2; // Green channel
        data[i + 2] = data[i + 2] * 1.2; // Blue channel
    }
    context.putImageData(imageData, 0, 0);

    const imgDataURL = canvas.toDataURL("image/png");
    console.log("Processed Image Data URI:", imgDataURL); // Debugging

    processImageFromCanvas(imgDataURL);
});

// Use Tesseract.js to process the preprocessed image
async function processImageFromCanvas(imageDataURL) {
    try {
        document.getElementById("loader").style.display = "block";

        const result = await Tesseract.recognize(imageDataURL, "eng", {
            logger: m => console.log(m) // Log OCR progress
        });

        console.log("Raw OCR Output:", result.data.text); // Debugging OCR output
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

    // Add unmatched lines to Other Specifications
    const remainingText = lines.filter(line => line.trim() !== "");
    if (remainingText.length > 0) {
        extractedData["Other Specifications"] = remainingText.join(" ");
    }

    displayExtractedData();
}

// Display the extracted data
function displayExtractedData() {
    const outputDiv = document.getElementById("outputAttributes");
    outputDiv.innerHTML = ""; // Clear previous data

    if (Object.keys(extractedData).length === 0) {
        outputDiv.innerHTML = "<p>No data yet...</p>";
        return;
    }

    Object.entries(extractedData).forEach(([key, value]) => {
        if (value && value !== "-") {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });

    console.log("Extracted Data:", extractedData); // Debugging
}

// Start Camera on Page Load
document.addEventListener("DOMContentLoaded", () => {
    startCamera();
});
