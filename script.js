// After data extraction, automatically store the record in Salesforce
function displayData() {
    outputDiv.innerHTML = "";
    Object.entries(extractedData).forEach(([key, value]) => {
        if (value && value !== "-") {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });

    // Automatically send the extracted data to the backend
    sendToSalesforce(extractedData);
}

// Send Extracted Data to Salesforce
async function sendToSalesforce(data) {
    const payload = {
        Product_Name__c: data['Product name'] || "",
        Colour__c: data['Colour'] || "",
        Motor_Type__c: data['Motor type'] || "",
        Frequency__c: data['Frequency'] || "",
        Gross_Weight__c: data['Gross weight'] || "",
        Ratio__c: data['Ratio'] || "",
        Motor_Frame__c: data['Motor Frame'] || "",
        Model__c: data['Model'] || "",
        Speed__c: data['Speed'] || "",
        Quantity__c: data['Quantity'] || "",
        Voltage__c: data['Voltage'] || "",
        Material__c: data['Material'] || "",
        Type__c: data['Type'] || "",
        Horse_Power__c: data['Horse power'] || "",
        Consignee__c: data['Consignee'] || "",
        LOT__c: data['LOT'] || "",
        Stage__c: data['Stage'] || "",
        Outlet__c: data['Outlet'] || "",
        Serial_Number__c: data['Serial number'] || "",
        Other_Specifications__c: data['Other Specifications'] || "",
        Total_Amount__c: data['Total amount'] || "",
        GSTIN__c: data['GSTIN'] || ""
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
