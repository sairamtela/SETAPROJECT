const BACKEND_ENDPOINT = "http://127.0.0.1:5000/api/push"; // Backend API URL

let extractedData = {}; // Store extracted data globally

// Initialize the camera
function startCamera() {
    const video = document.getElementById("video");
    const captureButton = document.getElementById("captureButton");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    // Access the user's webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error("Error accessing the camera:", error);
            alert("Camera access failed. Please check your permissions.");
        });

    // Capture the image when the button is clicked
    captureButton.addEventListener("click", () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height); // Draw video frame to canvas
        const capturedImage = canvas.toDataURL("image/png"); // Get the image as a data URL
        processImage(capturedImage); // Process the captured image
    });
}

// Process the image with Tesseract.js
async function processImage(imageData) {
    try {
        document.getElementById("loader").style.display = "block";
        const result = await Tesseract.recognize(imageData, "eng");

        // Map extracted text into structured data
        extractedData = mapExtractedData(result.data.text);

        console.log("Extracted Data:", extractedData); // Debugging purpose
    } catch (error) {
        alert("Error processing the image. Please try again.");
        console.error("Image processing error:", error);
    } finally {
        document.getElementById("loader").style.display = "none";
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

// Send extracted data to the backend
async function sendDataToBackend() {
    try {
        console.log("Sending Data to Backend:", extractedData);

        const response = await fetch(BACKEND_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(extractedData) // Send extracted data to backend
        });

        const result = await response.json();
        if (response.ok) {
            alert("Data successfully stored in Salesforce and Excel sheet!");
        } else {
            alert(`Backend error: ${result.error}`);
        }
    } catch (error) {
        alert("Failed to connect to the backend. Please try again.");
        console.error("Backend connection error:", error);
    }
}

// Initialize the camera on page load
document.addEventListener("DOMContentLoaded", startCamera);
