from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from simple_salesforce import Salesforce

app = Flask(__name__)
CORS(app)

# Define constants
EXCEL_FILE = "extracted_data.xlsx"

# Salesforce credentials
SF_USERNAME = "sairamtelagamsetti@sathkrutha.sandbox"
SF_PASSWORD = "Sairam12345@"
SF_SECURITY_TOKEN = "ZYaDg3Smv8Iw6PiiCW1e2Wlf"

# Initialize Salesforce connection
sf = Salesforce(
    username=SF_USERNAME,
    password=SF_PASSWORD,
    security_token=SF_SECURITY_TOKEN,
    domain="test"  # Use "login" for production
)

# Ensure Excel file exists
if not os.path.exists(EXCEL_FILE):
    pd.DataFrame(columns=["Field", "Value"]).to_excel(EXCEL_FILE, index=False)

@app.route("/api/push", methods=["POST"])
def store_data():
    try:
        # Parse incoming data
        data = request.json
        print("Received Data:", data)

        # Save data to Salesforce
        salesforce_data = {key.replace(" ", "_"): value for key, value in data.items()}
        sf_response = sf.Seta_Product_Details__c.create(salesforce_data)

        # Log data in Excel
        df = pd.DataFrame(data.items(), columns=["Field", "Value"])
        if os.path.exists(EXCEL_FILE):
            existing_df = pd.read_excel(EXCEL_FILE)
            df = pd.concat([existing_df, df], ignore_index=True)
        df.to_excel(EXCEL_FILE, index=False)

        return jsonify({
            "message": "Data stored in Salesforce and Excel sheet.",
            "salesforce_id": sf_response["id"]
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
