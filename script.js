// Keywords for data extraction
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
let allData = [];

// Elements
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const outputDiv = document.getElementById('outputAttributes');

// Map Extracted Text to Keywords and Capture Remaining Text
function processTextToAttributes(text) {
    const lines = text.split("\n");
    extractedData = {};
    let remainingText = [];

    keywords.forEach(keyword => {
        for (let line of lines) {
            if (line.includes(keyword)) {
                const value = line.split(":"[1]?.trim() || "-");
                if (value !== "-") {
                    extractedData[keyword] = value;
                }
                break;
            }
        }
    });

    // Capture remaining text that is not matched with keywords
    lines.forEach(line => {
        if (!Object.values(extractedData).some(value => line.includes(value))) {
            remainingText.push(line.trim());
        }
    });

    // Add remaining text as "Other Specifications"
    extractedData["Other Specifications"] = remainingText.join(" ");

    allData.push(extractedData);
    displayData();
}

// Display Extracted Data
function displayData() {
    outputDiv.innerHTML = "";
    Object.entries(extractedData).forEach(([key, value]) => {
        if (value) {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });
}

// Export to Salesforce
document.getElementById('exportButton').addEventListener('click', async () => {
    if (Object.keys(extractedData).length === 0) {
        alert("No extracted data available to export. Please process an image first.");
        return;
    }

    // Ensure all fields are sanitized as strings
    const sanitizedData = {};
    for (const [key, value] of Object.entries(extractedData)) {
        if (Array.isArray(value)) {
            sanitizedData[key] = value.join(", "); // Convert array to comma-separated string
        } else if (value !== undefined && value !== null) {
            sanitizedData[key] = value.toString(); // Convert other values to strings
        } else {
            sanitizedData[key] = ""; // Handle null or undefined as empty string
        }
    }

    try {
        console.log("Exporting Data to Salesforce:", sanitizedData);
        const response = await fetch('http://127.0.0.1:5000/export_to_salesforce', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sanitizedData), // Send sanitizedData directly
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
});

// Start Camera on Load
startCamera();
