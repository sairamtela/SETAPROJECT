const keywords = [
    "Model Name/Number", "Type", "Motor Phase", "Head", "Power Rating",
    "Country of Origin", "Minimum Order Quantity", "Delivery Time"
];

let currentFacingMode = "environment";
let stream = null;
let extractedData = {};
let allData = [];

const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const outputDiv = document.getElementById('outputAttributes');

// Start the camera
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

// Flip the camera
document.getElementById('flipButton').addEventListener('click', () => {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    startCamera();
});

// Capture and preprocess the image
document.getElementById('captureButton').addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Pass the image to OCR
    canvas.toBlob(blob => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => processImage(img);
    }, 'image/png');
});

// Process the image with Tesseract.js
async function processImage(img) {
    outputDiv.innerHTML = "<p>Processing...</p>";
    try {
        const result = await Tesseract.recognize(img, 'eng', { logger: m => console.log(m) });
        console.log("Raw OCR Result:", result.data.text); // Debug OCR output
        if (result && result.data.text) {
            processTextToAttributes(result.data.text);
        } else {
            outputDiv.innerHTML = "<p>No text detected. Please try again.</p>";
        }
    } catch (error) {
        console.error("Tesseract.js Error:", error);
        outputDiv.innerHTML = "<p>Error processing image. Please try again.</p>";
    }
}

// Map OCR text to attributes
function processTextToAttributes(text) {
    const lines = text.split("\n").filter(line => line.trim() !== "");
    extractedData = {};

    keywords.forEach(keyword => {
        for (let line of lines) {
            if (line.toLowerCase().includes(keyword.toLowerCase())) {
                const value = line.split(":")[1]?.trim() || line.split(" ")[1]?.trim() || "-";
                extractedData[keyword] = value;
                break;
            }
        }
    });

    // Store unprocessed text in "Other Specifications"
    const remainingText = lines
        .filter(line => !Object.values(extractedData).some(value => line.includes(value)))
        .join(" ");
    extractedData["Other Specifications"] = remainingText.trim() || "-";

    allData.push(extractedData);
    displayData();
}

// Display the extracted data
function displayData() {
    outputDiv.innerHTML = "";
    Object.entries(extractedData).forEach(([key, value]) => {
        if (value) {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });
}

// Export data to Excel
document.getElementById('exportButton').addEventListener('click', () => {
    const workbook = XLSX.utils.book_new();
    const headers = [...keywords, "Other Specifications"];
    const data = allData.map(row => headers.map(key => row[key] || "-"));
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
    XLSX.writeFile(workbook, "Extracted_Data.xlsx");
});

// Start the camera on load
startCamera();
