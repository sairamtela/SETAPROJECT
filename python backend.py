from flask import Flask, request, jsonify
from simple_salesforce import Salesforce
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS to allow cross-origin requests

# Salesforce Authentication
sf = Salesforce(
    username="sairamtelagamsetti@sathkrutha.sandbox",
    password="Sairam12345@",
    security_token="FTvAU65IiITF4541K2Y5tDgi",
    domain="test"
)

@app.route('/api/push', methods=['POST'])
def push_data():
    """Push data to Salesforce"""
    data = request.json
    try:
        # Log the received data
        print("Payload received from frontend:", data)

        # Map extracted data to Salesforce field API names
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
            "Voltage__c": data.get("Voltage", ""),
        }

        # Log the payload sent to Salesforce
        print("Payload sent to Salesforce:", payload)

        # Push data to Salesforce
        response = sf.SETA_Product_Details__c.create(payload)
        print("Salesforce Response:", response)

        return jsonify({"message": "Data pushed to Salesforce successfully", "response": response}), 200
    except Exception as e:
        print("Error pushing data to Salesforce:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
