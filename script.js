let videoStream = null; // Store the video stream globally
let currentFacingMode = "environment"; // Default to back camera (if available)

// Initialize the camera
function startCamera() {
    const video = document.getElementById("video");

    // Get media devices and start the camera
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode }, // Default to back camera
    })
    .then(stream => {
        videoStream = stream; // Save the stream globally
        video.srcObject = stream; // Set the video stream to the video element
        video.play();
    })
    .catch(error => {
        console.error("Error accessing the camera:", error);
        alert("Camera access failed. Please check your permissions or if a camera is available.");
    });
}

// Flip the camera (toggle between front and back cameras)
function flipCamera() {
    if (videoStream) {
        // Stop all tracks of the current stream
        videoStream.getTracks().forEach(track => track.stop());
    }
    // Toggle the facing mode
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
    startCamera(); // Restart the camera with the new mode
}

// Capture the image
function captureImage() {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a data URL and process it
    const capturedImage = canvas.toDataURL("image/png");
    processImage(capturedImage);
}

// Process the image with Tesseract.js
async function processImage(imageData) {
    try {
        document.getElementById("loader").style.display = "block"; // Show the loader
        const result = await Tesseract.recognize(imageData, "eng"); // OCR process

        // Map extracted text into structured data
        extractedData = mapExtractedData(result.data.text);
        console.log("Extracted Data:", extractedData); // Debugging purpose
    } catch (error) {
        alert("Error processing the image. Please try again.");
        console.error("Image processing error:", error);
    } finally {
        document.getElementById("loader").style.display = "none"; // Hide the loader
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

    // Display extracted data
    displayExtractedData(mappedData);

    return mappedData;
}

// Display extracted data for review
function displayExtractedData(data) {
    const outputDiv = document.getElementById("outputAttributes");
    outputDiv.innerHTML = "";
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
