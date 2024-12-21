from flask import Flask, request, jsonify
from simple_salesforce import Salesforce
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Salesforce credentials
SF_USERNAME = 'sairamtelagamsetti@sathkrutha.sandbox'
SF_PASSWORD = 'Sairam12345@'
SF_SECURITY_TOKEN = 'FTvAU65IiITF4541K2Y5tDgi'
SF_DOMAIN = 'login'

# Initialize Salesforce
def initialize_salesforce():
    try:
        sf = Salesforce(
            username=SF_USERNAME,
            password=SF_PASSWORD,
            security_token=SF_SECURITY_TOKEN,
            domain=SF_DOMAIN
        )
        print("Salesforce connection established.")
        return sf
    except Exception as e:
        print(f"Error initializing Salesforce: {e}")
        return None

sf = initialize_salesforce()

@app.route('/export_to_salesforce', methods=['POST'])
def export_to_salesforce():
    if not sf:
        return jsonify({"error": "Salesforce connection failed"}), 500

    # Get data from the frontend
    data = request.json.get('extractedData', {})
    print("Received Extracted Data:", data)  # Debugging

    if not data:
        return jsonify({"error": "No extracted data received"}), 400

    try:
        # Map data to Salesforce fields
        record = {
            'Name': data.get('Product name', 'Default Name'),  # Default Name if missing
            'Voltage__c': data.get('Voltage', None),           # Skip if missing
            'Phase__c': data.get('Phase', 'Unknown Phase'),    # Default to 'Unknown Phase'
            'Brand__c': data.get('Brand', 'Unknown Brand'),    # Default to 'Unknown Brand'
            'Power__c': data.get('Power', None),               # Skip if missing
            'Other_Specifications__c': data.get('Other Specifications', None),  # Skip if missing
        }
        print("Mapped Salesforce Record:", record)  # Debugging

        # Replace 'SETA_product_details__c' with your actual Salesforce object API name
        result = sf.SETA_product_details__c.create(record)
        print(f"Record created in Salesforce with ID: {result['id']}")
        return jsonify({"success": True, "record_id": result['id']}), 201
    except Exception as e:
        print(f"Error saving data to Salesforce: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
