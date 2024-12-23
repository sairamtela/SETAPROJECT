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
    "Pipesize", "Manufacturer", "Office", "Size", "SR number", "RPM", 
    "frame", "Other Specifications"
];

let extractedData = {}; // Store extracted data here
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
    console.log("Captured Image Data URI:", img.src); // Debugging the captured image
    img.onload = () => processImage(img);
});

// Use Tesseract.js to process the captured image and extract text
async function processImage(img) {
    try {
        document.getElementById("loader").style.display = "block";
        const result = await Tesseract.recognize(img, "eng", {
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

    // Store extracted data for further use
    storeExtractedData(extractedData);

    // Display the extracted data
    displayExtractedData();
}

// Store extracted data in a variable for reuse
function storeExtractedData(data) {
    console.log("Stored Extracted Data:", data); // Log data for verification
    // You can now use the `data` variable in other parts of your application
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
        if (value && value !== "-") { // Only display attributes with valid values
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });

    console.log("Extracted Data for Output:", extractedData); // Log the data for debugging
}

// Start Camera on Page Load
document.addEventListener("DOMContentLoaded", () => {
    startCamera(); // Automatically start the camera when the page loads
});
