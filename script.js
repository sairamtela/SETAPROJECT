document.getElementById('captureButton').addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Save image and pass to backend
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append("image", blob, "captured_image.png");

        fetch("http://localhost:5000/ocr", { // Point to backend OCR endpoint
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayData(data.extracted);
            } else {
                outputDiv.innerHTML = "<p>Failed to extract data. Try again!</p>";
            }
        })
        .catch(error => console.error("Error in OCR request:", error));
    }, 'image/png');
});
