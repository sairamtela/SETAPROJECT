<script>
    const keywords = [
        "Engine Type", "Motor Phase", "Voltage", "Frequency", "Material", "Motor Speed"
    ];

    let currentFacingMode = "environment";
    let stream = null;
    let extractedData = {};
    let allData = [];

    const video = document.getElementById('camera');
    const canvas = document.getElementById('canvas');
    const outputDiv = document.getElementById('outputAttributes');

    // Start Camera
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

    // Flip Camera
    document.getElementById('flipButton').addEventListener('click', () => {
        currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
        startCamera();
    });

    // Capture and Preprocess Image
    document.getElementById('captureButton').addEventListener('click', () => {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Preprocess the image
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const processedData = preprocessImage(imageData, context);
        canvas.putImageData(processedData, 0, 0);

        // Process the preprocessed image
        canvas.toBlob(blob => {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            img.onload = () => processImage(img);
        }, 'image/png');
    });

    // Image Preprocessing Function
    function preprocessImage(imageData, context) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3; // Grayscale
            data[i] = data[i + 1] = data[i + 2] = avg > 128 ? 255 : 0; // Thresholding
        }
        return new ImageData(data, imageData.width, imageData.height);
    }

    // Process Image with Tesseract.js
    async function processImage(img) {
        outputDiv.innerHTML = "<p>Processing...</p>";
        try {
            const result = await Tesseract.recognize(img, 'eng', { logger: m => console.log(m) });
            if (result && result.data.text) {
                console.log("OCR Result:", result.data.text);
                processTextToAttributes(result.data.text);
            } else {
                outputDiv.innerHTML = "<p>No text detected. Please try again.</p>";
            }
        } catch (error) {
            console.error("Tesseract.js Error:", error);
            outputDiv.innerHTML = "<p>Error processing image. Please try again.</p>";
        }
    }

    // Map Extracted Text to Keywords
    function processTextToAttributes(text) {
        const lines = text.split("\n").filter(line => line.trim() !== "");
        extractedData = {};

        // Extract fields based on keywords
        keywords.forEach(keyword => {
            for (let line of lines) {
                if (line.toLowerCase().includes(keyword.toLowerCase())) {
                    const value = line.split(":")[1]?.trim() || line.split(" ")[1]?.trim() || "-";
                    if (value !== "-") {
                        extractedData[keyword] = value;
                    }
                    break;
                }
            }
        });

        // Store remaining unprocessed text
        const remainingText = lines
            .filter(line => !Object.values(extractedData).some(value => line.includes(value)))
            .join(" ");
        extractedData["Other Specifications"] = remainingText.trim() || "-";

        allData.push(extractedData);
        displayData();
    }

    // Display Data
    function displayData() {
        outputDiv.innerHTML = "";
        Object.entries(extractedData).forEach(([key, value]) => {
            if (value) {
                outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
            }
        });
    }

    // Export to Excel
    document.getElementById('exportButton').addEventListener('click', () => {
        const workbook = XLSX.utils.book_new();
        const headers = [...keywords, "Other Specifications"];
        const data = allData.map(row => headers.map(key => row[key] || "-"));
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

        XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
        XLSX.writeFile(workbook, "Extracted_Data.xlsx");
    });

    // Start Camera on Load
    startCamera();
</script>
