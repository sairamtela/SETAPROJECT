from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from simple_salesforce import Salesforce

app = Flask(__name__)
CORS(app)

# Excel file name
EXCEL_FILE = "extracted_data.xlsx"

# Salesforce credentials (replace with your actual credentials)
sf = Salesforce(
    username="sairamtelagamsetti@sathkrutha.sandbox",
    password="Sairam12345@",
    security_token="ZYaDg3Smv8Iw6PiiCW1e2Wlf",
    domain="test"  # Use "login" for production or "test" for sandbox
)

# Ensure Excel file exists
if not os.path.exists(EXCEL_FILE):
    pd.DataFrame(columns=["Field", "Value"]).to_excel(EXCEL_FILE, index=False)

@app.route("/api/push", methods=["POST"])
def store_data():
    try:
        # Get the incoming JSON data
        data = request.json
        print("Received Data:", data)

        # Save to Salesforce
        salesforce_data = {key: data.get(key, "") for key in data}
        sf_response = sf.Seta_Product_Details__c.create(salesforce_data)

        # Log data to Excel
        df = pd.DataFrame(data.items(), columns=["Field", "Value"])
        if os.path.exists(EXCEL_FILE):
            existing_df = pd.read_excel(EXCEL_FILE)
            df = pd.concat([existing_df, df], ignore_index=True)
        df.to_excel(EXCEL_FILE, index=False)

        # Return success response
        return jsonify({"message": "Data stored in Salesforce and Excel sheet.", "salesforce_id": sf_response["id"]})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
