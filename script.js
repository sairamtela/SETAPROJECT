let videoStream = null; // Store the video stream globally
let currentFacingMode = "environment"; // Default to back camera (if available)

// Initialize the camera
function startCamera() {
    const video = document.getElementById("video");

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera not supported in your browser.");
        console.error("getUserMedia is not supported in this browser.");
        return;
    }

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
        alert("Failed to access the camera. Check your device settings and permissions.");
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

    if (!videoStream) {
        alert("Camera not initialized. Please refresh the page and try again.");
        return;
    }

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a data URL and process it
    const capturedImage = canvas.toDataURL("image/png");
    processImage(capturedImage);
}

// Initialize the camera on page load
document.addEventListener("DOMContentLoaded", () => {
    startCamera(); // Start the camera

    // Attach button event handlers
    document.getElementById("captureButton").addEventListener("click", captureImage);
    document.getElementById("flipButton").addEventListener("click", flipCamera);
});
