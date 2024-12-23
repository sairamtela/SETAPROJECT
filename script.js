// Elements
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const outputDiv = document.getElementById('outputAttributes');

let currentFacingMode = "environment";
let stream = null;
let extractedData = {}; // This variable will store the final extracted data

// Keywords for filtering specific data
const keywords = [
    "Engine Type", "Motor Phase", "Voltage", "Frequency", "Material",
    "Motor Speed", "Cooling Method", "Model"
];

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
        console.error("Error accessing camera:", err);
        alert("Unable to access the camera. Please check your browser settings.");
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
        const result = await Tesseract.recognize(img, 'eng', {
            logger: m => console.log(m),
        });
        if (result && result.data.text) {
            console.log("OCR Result:", result.data.text);
            processText(result.data.text);
        } else {
            outputDiv.innerHTML = "<p>No text detected. Please try again.</p>";
        }
    } catch (error) {
        console.error("Tesseract.js Error:", error);
        outputDiv.innerHTML = "<p>Error processing image. Please try again.</p>";
    }
}

// Process OCR Text and Match Keywords
function processText(text) {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line);
    extractedData = {}; // Reset the variable for new data

    lines.forEach(line => {
        keywords.forEach(keyword => {
            if (line.includes(keyword)) {
                const [key, value] = line.split(":");
                if (key && value) {
                    extractedData[key.trim()] = value.trim();
                }
            }
        });
    });

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
        console.log("Extracted Data Stored:", extractedData); // Log the variable for backend usage
    }
}

// Example Backend Call (Uncomment to use)
// function sendToBackend() {
//     fetch("http://127.0.0.1:5000/api/push", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(extractedData) // Send the data to backend
//     })
//         .then(response => response.json())
//         .then(data => console.log("Backend Response:", data))
//         .catch(error => console.error("Error sending data to backend:", error));
// }

// Start Camera on Page Load
startCamera();
