<!DOCTYPE html>
<html>
<head>
    <title>Data Extraction</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tesseract.js/dist/tesseract.min.js"></script>
</head>
<body>
    <video id="camera" autoplay></video>
    <canvas id="canvas" style="display:none;"></canvas>
    <div id="outputAttributes"></div>
    <button id="flipButton">Flip Camera</button>
    <button id="captureButton">Capture Image</button>
    <button id="exportButton">Export to Salesforce</button>

    <script>
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
            "Pipesize", "Manufacturer", "Office", "Size", "Ratio", "SR number", "volts", "weight", "RPM", 
            "frame"
        ];

        let currentFacingMode = "environment";
        let stream = null;
        let extractedData = {};
        let allData = [];

        // Start Camera
        async function startCamera() {
            try {
                if (stream) stream.getTracks().forEach(track => track.stop());
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: currentFacingMode, width: 1280, height: 720 }
                });
                document.getElementById('camera').srcObject = stream;
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

        // Capture Image
        document.getElementById('captureButton').addEventListener('click', () => {
            const canvas = document.getElementById('canvas');
            const video = document.getElementById('camera');
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
            const outputDiv = document.getElementById('outputAttributes');
            outputDiv.innerHTML = "<p>Processing...</p>";
            try {
                const result = await Tesseract.recognize(img, 'eng', { logger: m => console.log(m) });
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

        // Map Extracted Text to Keywords and Capture Remaining Text
        function processTextToAttributes(text) {
            const lines = text.split("\n");
            extractedData = {};
            let remainingText = [];

            keywords.forEach(keyword => {
                for (let line of lines) {
                    if (line.includes(keyword)) {
                        extractedData[keyword] = line.split(":")[1]?.trim() || line.split("-")[1]?.trim() || "-";
                        break;
                    }
                }
            });

            // Add remaining text as "Other Specifications"
            lines.forEach(line => {
                if (!Object.values(extractedData).some(value => line.includes(value))) {
                    remainingText.push(line.trim());
                }
            });

            extractedData["Other Specifications"] = remainingText.join(" ");
            allData.push(extractedData);
            displayData();
        }

        // Display Data
        function displayData() {
            const outputDiv = document.getElementById('outputAttributes');
            outputDiv.innerHTML = "";
            Object.entries(extractedData).forEach(([key, value]) => {
                if (value) {
                    outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
                }
            });
        }

        // Export to Salesforce
        document.getElementById('exportButton').addEventListener('click', async () => {
            if (allData.length === 0) {
                alert("No data to export!");
                return;
            }

            const latestData = allData[allData.length - 1];

            try {
                const response = await fetch('http://127.0.0.1:5000/export_to_salesforce', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(latestData)
                });

                const result = await response.json();
                if (response.ok) {
                    alert(`Record created successfully in Salesforce! Record ID: ${result.record_id}`);
                } else {
                    alert(`Error creating record in Salesforce: ${result.error}`);
                }
            } catch (error) {
                console.error("Error sending data to Salesforce:", error);
                alert("Error sending data to Salesforce. Please try again.");
            }
        });

        // Start Camera on Load
        startCamera();
    </script>
</body>
</html>
