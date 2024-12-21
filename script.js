// Export to Salesforce
document.getElementById('exportButton').addEventListener('click', async () => {
    if (Object.keys(extractedData).length === 0) {
        alert("No extracted data available to export. Please process an image first.");
        return;
    }

    console.log("Exporting Data to Salesforce:", extractedData);  // Debugging

    try {
        const response = await fetch('http://127.0.0.1:5000/export_to_salesforce', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ extractedData }),
        });

        const result = await response.json();
        console.log("Backend Response:", result);  // Debugging

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
