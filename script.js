let videoStream = null; // Store the video stream globally
let currentFacingMode = "environment"; // Default to back camera (if available)
let extractedData = {}; // Store extracted data globally

// Initialize the camera
function startCamera() {
    const video = document.getElementById("video");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera not supported in your browser.");
        console.error("getUserMedia is not supported in this browser.");
        return;
    }

    navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode },
    })
    .then(stream => {
        videoStream = stream; // Save the stream globally
        video.srcObject = stream; // Set the video stream to the video element
        video.play();
        console.log("Camera started successfully");
    })
    .catch(error => {
        console.error("Error accessing the camera:", error);
        alert("Failed to access the camera. Check your device settings and permissions.");
    });
}

// Flip the camera (toggle between front and back cameras)
function flipCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop()); // Stop all tracks
    }
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user"; // Toggle mode
    startCamera(); // Restart the camera
}

// Capture the image
function captureImage() {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    if (!videoStream) {
        alert("Camera not initialized. Please refresh the page and try again.");
        return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height); // Draw video frame to canvas
    const capturedImage = canvas.toDataURL("image/png"); // Get the image as a data URL
    console.log("Image captured:", capturedImage);
    processImage(capturedImage); // Process the captured image
}

// Process the image with Tesseract.js
async function processImage(imageData) {
    try {
        document.getElementById("loader").style.display = "block"; // Show loader
        const result = await Tesseract.recognize(imageData, "eng"); // OCR process

        extractedData = mapExtractedData(result.data.text); // Map text to structured data
        console.log("Extracted Data:", extractedData); // Debugging output
    } catch (error) {
        alert("Error processing the image. Please try again.");
        console.error("Image processing error:", error);
    } finally {
        document.getElementById("loader").style.display = "none"; // Hide loader
    }
}

// Map extracted text to predefined keywords
function mapExtractedData(text) {
    const keywords = [
        "Product name", "Colour", "Motor type", "Frequency", "Gross weight", "Ratio",
        "Motor Frame", "Model", "Quantity", "Voltage", "Material", "Horse power",
        "Stage", "GSTIN", "Seller Address", "Manufacture date", "Company name",
        "Customer care number", "Total amount", "Other Specifications"
    ];

    const lines = text.split("\n");
    const mappedData = {};
    let remainingText = [];

    // Match lines to keywords
    keywords.forEach(keyword => {
        lines.forEach((line, index) => {
            const regex = new RegExp(`${keyword}\\s*[:\\-]?\\s*(.+)`, "i");
            const match = line.match(regex);
            if (match && match[1]) {
                mappedData[keyword] = match[1].trim();
                lines[index] = ""; // Mark line as processed
            }
        });
    });

    // Add unmatched lines to "Other Specifications"
    remainingText = lines.filter(line => line.trim() !== "");
    mappedData["Other Specifications"] = remainingText.join(" ");

    displayExtractedData(mappedData); // Display extracted data

    return mappedData;
}

// Display extracted data for review
function displayExtractedData(data) {
    const outputDiv = document.getElementById("outputAttributes");
    outputDiv.innerHTML = ""; // Clear previous content
    Object.entries(data).forEach(([key, value]) => {
        if (value) {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });
}

// Initialize the camera on page load
document.addEventListener("DOMContentLoaded", () => {
    startCamera(); // Start the camera

    // Attach button event handlers
    document.getElementById("captureButton").addEventListener("click", captureImage);
    document.getElementById("flipButton").addEventListener("click", flipCamera);
});
