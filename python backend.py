from flask import Flask, request, jsonify
from flask_cors import CORS
from simple_salesforce import Salesforce
import pandas as pd
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Connect to Salesforce
try:
    sf = Salesforce(
        username="sairamtelagamsetti@sathkrutha.sandbox",
        password="Sairam12345@",
        security_token="ZYaDg3Smv8Iw6PiiCW1e2Wlf",
        domain="test"
    )
    print("Salesforce connection established successfully.")
except Exception as e:
    print(f"Error connecting to Salesforce: {e}")
    sf = None  # Mark Salesforce as unavailable

@app.route('/api/push', methods=['POST'])
def push_data():
    """Receive data from frontend, push to Salesforce, and save to Excel."""
    try:
        data = request.json
        print(f"Received data: {data}")

        # Verify Salesforce connection
        if not sf:
            raise Exception("Salesforce connection not established. Check credentials.")

        # Map data to Salesforce fields
        payload = {
            "Brand__c": data.get("Brand", ""),
            "Colour__c": data.get("Colour", ""),
            "Company_Name__c": data.get("Company name", ""),
            "Customer_Care_Number__c": data.get("Customer care number", ""),
            "Frequency__c": data.get("Frequency", ""),
            "Gross_Weight__c": data.get("Gross weight", ""),
            "GSTIN__c": data.get("GSTIN", ""),
            "Head_Size__c": data.get("Head Size", ""),
            "Height__c": data.get("Height", ""),
            "Horse_Power__c": data.get("Horse power", ""),
            "Manufacture_Date__c": data.get("Manufacture date", ""),
            "Material__c": data.get("Material", ""),
            "Model__c": data.get("Model", ""),
            "Motor_Frame__c": data.get("Motor Frame", ""),
            "Motor_Type__c": data.get("Motor type", ""),
            "MRP__c": data.get("MRP", ""),
            "Other_Specifications__c": data.get("Other Specifications", ""),
            "Phase__c": data.get("Phase", ""),
            "Product_Name__c": data.get("Product name", ""),
            "Quantity__c": data.get("Quantity", ""),
            "Ratio__c": data.get("Ratio", ""),
            "Seller_Address__c": data.get("Seller Address", ""),
            "Stage__c": data.get("Stage", ""),
            "Total_Amount__c": data.get("Total amount", ""),
            "Usage_Application__c": data.get("Usage/Application", ""),
            "Voltage__c": data.get("Voltage", "")
        }

        # Push data to Salesforce
        response = sf.SETA_Product_Details__c.create(payload)
        print(f"Data pushed to Salesforce: {response}")

        # Save data to Excel
        save_to_excel(data)

        return jsonify({"message": "Data successfully pushed to Salesforce and saved to Excel!"}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

# Save data to Excel
def save_to_excel(data):
    try:
        file_name = "Extracted_Data.xlsx"
        df = pd.DataFrame([data])

        if os.path.exists(file_name):
            existing_df = pd.read_excel(file_name)
            df = pd.concat([existing_df, df], ignore_index=True)

        df.to_excel(file_name, index=False)
        print(f"Data saved to Excel: {file_name}")
    except Exception as e:
        print(f"Error saving to Excel: {e}")
        raise

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
