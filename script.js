const keywords = [
    "Product name", "Colour", "Motor type", "Frequency", "Gross weight", "Ratio",
    "Motor Frame", "Model", "Speed", "Quantity", "Voltage", "Material", "Type",
    "Horse power", "Consignee", "LOT", "Stage", "Outlet", "Serial number", "Head Size",
    "Delivery size", "Phase", "Size", "MRP", "Use before", "Height",
    "Maximum Discharge Flow", "Discharge Range", "Assembled by", "Manufacture date",
    "Company name", "Customer care number", "Seller Address", "Seller email", "GSTIN",
    "Total amount", "Payment status", "Payment method", "Invoice date", "Warranty", 
    "Brand", "Motor horsepower", "Power", "Motor phase", "Engine type", "Tank capacity",
    "Head", "Usage/Application", "Weight", "Volts", "Hertz", "Frame", "Mounting", "Toll free number",
    "Pipesize", "Manufacturer", "Office", "SR number", "RPM"
];

let currentFacingMode = "environment";
let stream = null;
let extractedData = {};

// Elements
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const outputDiv = document.getElementById('outputAttributes');

// Start Camera
async function startCamera() {
    try {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: { facingMode: currentFacingMode, width: 1280, height: 720 }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints).catch(err => {
            console.warn("Facing mode unsupported. Trying default video device.", err);
            return navigator.mediaDevices.getUserMedia({ video: true });
        });

        video.srcObject = stream;
        video.play();
    } catch (err) {
        handleCameraError(err);
    }
}

// Handle Camera Errors
function handleCameraError(err) {
    const errorMessages = {
        NotAllowedError: "Camera access denied. Please allow camera access in your browser settings.",
        NotFoundError: "No camera device found. Connect a camera and try again.",
        OverconstrainedError: "The requested camera constraints could not be satisfied. Check your device settings."
    };
    alert(errorMessages[err.name] || "An unknown error occurred while accessing the camera.");
    console.error("Camera error:", err);
}

// Flip Camera
document.getElementById('flipButton').addEventListener('click', () => {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    startCamera();
});

// Capture Image and Process
document.getElementById('captureButton').addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgDataURL = canvas.toDataURL("image/png");
    processImage(imgDataURL);
});

// Process Image with Tesseract.js
async function processImage(imageDataURL) {
    try {
        outputDiv.innerHTML = "<p>Processing...</p>";

        const result = await Tesseract.recognize(imageDataURL, 'eng', { logger: m => console.log(m) });

        if (result && result.data.text) {
            console.log("Extracted Text:", result.data.text); // Debug log
            processTextToAttributes(result.data.text);
        } else {
            outputDiv.innerHTML = "<p>No text detected. Please try again.</p>";
        }
    } catch (error) {
        alert("Error processing the image. Please try again.");
        console.error("Tesseract.js Error:", error);
    }
}

// Map Extracted Text to Keywords
async function processTextToAttributes(text) {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line);
    extractedData = {};
    const otherSpecifications = [];

    // Map extracted text to predefined keywords
    keywords.forEach(keyword => {
        for (let line of lines) {
            if (line.toLowerCase().includes(keyword.toLowerCase())) {
                const value = line.split(/[:\-]/)[1]?.trim() || "-";
                if (value !== "-") {
                    extractedData[keyword] = value;
                }
                break;
            }
        }
    });

    // Capture unmatched lines
    lines.forEach(line => {
        if (!Object.values(extractedData).some(value => line.includes(value))) {
            otherSpecifications.push(line);
        }
    });

    extractedData["Other Specifications"] = otherSpecifications.join(" ");
    displayData();

    // Check if extracted data has content and send to backend
    if (Object.keys(extractedData).length > 0) {
        console.log("Extracted Data:", extractedData); // Debug log
        await sendToSalesforce(extractedData);
    }
}

// Display Extracted Data
function displayData() {
    outputDiv.innerHTML = "";
    Object.entries(extractedData).forEach(([key, value]) => {
        if (value && value !== "-") {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });
}

// Send Extracted Data to Salesforce
async function sendToSalesforce(data) {
    // Prepare the payload for Salesforce
    const payload = {
        Product_Name__c: data['Product name'] || "",
        Colour__c: data['Colour'] || "",
        Motor_Type__c: data['Motor type'] || "",
        Frequency__c: data['Frequency'] || "",
        Gross_Weight__c: data['Gross weight'] || "",
        Ratio__c: data['Ratio'] || "",
        Other_Specifications__c: data['Other Specifications'] || ""
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/export_to_salesforce', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (response.ok) {
            alert(`Record created successfully in Salesforce. Record ID: ${result.record_id}`);
        } else {
            alert(`Error creating record in Salesforce: ${result.error}`);
        }
    } catch (error) {
        console.error("Error exporting data to Salesforce:", error);
        alert("Error exporting data to Salesforce. Check console for details.");
    }
}

// Start Camera on Load
startCamera();
