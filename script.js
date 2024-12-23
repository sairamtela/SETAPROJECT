// Elements
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const outputDiv = document.getElementById('outputAttributes');

let currentFacingMode = "environment";
let stream = null;

// Start Camera
async function startCamera() {
    try {
        if (stream) {
            // Stop previous stream
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
        const result = await Tesseract.recognize(img, 'eng', { logger: m => console.log(m) });
        if (result && result.data.text) {
            console.log("OCR Result:", result.data.text);
            displayData(result.data.text);
        } else {
            outputDiv.innerHTML = "<p>No text detected. Please try again.</p>";
        }
    } catch (error) {
        console.error("Tesseract.js Error:", error);
        outputDiv.innerHTML = "<p>Error processing image. Please try again.</p>";
    }
}

// Display Extracted Data
function displayData(text) {
    outputDiv.innerHTML = `<p><strong>Extracted Text:</strong></p><pre>${text}</pre>`;
}

// Start Camera on Page Load
startCamera();
