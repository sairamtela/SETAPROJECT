document.getElementById('exportButton').addEventListener('click', async () => {
    const fileName = "Extracted_Text_Data.xlsx";
    const maxRows = 1000; // Limit for rows to avoid overflow (adjustable as per need)

    try {
        if (allData.length === 0) {
            alert("No data to export!");
            return;
        }

        // Step 1: Collect all unique keys (attributes) as headers
        const allKeys = new Set();
        allData.forEach(row => Object.keys(row).forEach(key => allKeys.add(key)));
        const headers = Array.from(allKeys);

        // Step 2: Create rows of data matching the headers
        const rows = allData.map(row =>
            headers.map(key => row[key] || "-")
        );

        // Step 3: Load existing Excel file (if available)
        let workbook, worksheet, existingData = [];
        try {
            const response = await fetch(fileName);
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                workbook = XLSX.read(buffer, { type: "array" });
                worksheet = workbook.Sheets["Extracted Data"];
                existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            }
        } catch (err) {
            console.log("Excel file not found. Creating a new one...");
            workbook = XLSX.utils.book_new();
        }

        // Step 4: Prepare combined data
        if (!worksheet) {
            // If worksheet doesn't exist, initialize it with headers
            existingData = [headers];
        }

        const currentRowCount = existingData.length;
        const availableRows = maxRows - currentRowCount;

        if (rows.length > availableRows) {
            alert(`Cannot export. Sheet has only ${availableRows} rows left.`);
            return;
        }

        // Append rows to existing data
        const updatedData = [...existingData, ...rows];

        // Step 5: Write back to Excel
        worksheet = XLSX.utils.aoa_to_sheet(updatedData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
        XLSX.writeFile(workbook, fileName);

        alert("Data successfully stored in Excel file!");

    } catch (error) {
        console.error("Error exporting to Excel:", error);
        alert("Failed to export the Excel file. Check console logs for details.");
    }
});
