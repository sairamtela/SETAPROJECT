const BACKEND_ENDPOINT = "http://127.0.0.1:5000/api/push"; // Backend API URL

let extractedData = {}; // Store extracted data globally

// Send extracted data to the backend
async function sendDataToBackend() {
    try {
        console.log("Sending Data to Backend:", extractedData);

        const response = await fetch(BACKEND_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(extractedData)
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

// Use Tesseract.js to process the captured image and extract text
async function processImage(img) {
    try {
        document.getElementById("loader").style.display = "block";
        const result = await Tesseract.recognize(img, "eng");

        mapExtractedData(result.data.text); // Map text to structured data
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
    extractedData = {};
    let remainingText = [];

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

    // Add unmatched lines to "Other Specifications"
    remainingText = lines.filter(line => line.trim() !== "");
    extractedData["Other Specifications"] = remainingText.join(" ");

    displayExtractedData(); // Display extracted data
}

// Display extracted data for review
function displayExtractedData() {
    const outputDiv = document.getElementById("outputAttributes");
    outputDiv.innerHTML = "";
    Object.entries(extractedData).forEach(([key, value]) => {
        if (value) {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });
}

// Initialize camera or other UI events
document.addEventListener("DOMContentLoaded", () => {
    // Add your camera initialization logic here
});
