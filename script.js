let videoStream = null; // Store the video stream globally
let currentFacingMode = "environment"; // Default to back camera (if available)

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
        videoStream = stream;
        video.srcObject = stream;
        video.play();
        console.log("Camera started successfully");
    })
    .catch(error => {
        console.error("Error accessing the camera:", error);
        alert("Failed to access the camera. Check your device settings and permissions.");
    });
}

// Flip the camera
function flipCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
    startCamera();
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

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const capturedImage = canvas.toDataURL("image/png");
    console.log("Image captured:", capturedImage);
    processImage(capturedImage);
}

// Initialize the camera on page load
document.addEventListener("DOMContentLoaded", () => {
    startCamera();
    document.getElementById("captureButton").addEventListener("click", captureImage);
    document.getElementById("flipButton").addEventListener("click", flipCamera);
});
