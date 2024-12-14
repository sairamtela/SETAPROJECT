// DOM Elements
const video = document.getElementById('video');
const flipCameraBtn = document.getElementById('flipCamera');
const captureButton = document.getElementById('captureButton');
const canvas = document.getElementById('canvas');
const shutterSound = document.getElementById('shutterSound');
const ctx = canvas.getContext('2d');

// Variables
let currentStream = null;
let facingMode = 'environment'; // Default to back camera

// Function to start the camera
async function startCamera() {
    // Stop current stream if it exists
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    // Get new stream based on the facing mode
    try {
        const constraints = {
            video: { facingMode }
        };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Could not access camera. Please allow permissions.');
    }
}

// Capture Image
function captureImage() {
    // Play shutter sound
    shutterSound.currentTime = 0; // Reset the sound to the beginning
    shutterSound.play();

    // Set canvas dimensions to match the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame on the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Save the image as a file
    const imageData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'captured_image.png';
    link.click();
}

// Flip Camera
flipCameraBtn.addEventListener('click', () => {
    facingMode = facingMode === 'environment' ? 'user' : 'environment'; // Toggle camera
    startCamera();
});

// Capture Button Event
captureButton.addEventListener('click', captureImage);

// Initialize Camera on Page Load
startCamera();
