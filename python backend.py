from flask import Flask, request, jsonify
from simple_salesforce import Salesforce

app = Flask(__name__)

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
    if not data:
        return jsonify({"error": "No extracted data received"}), 400

    try:
        # Map data to Salesforce fields
        record = {
            'Name': data.get('Product name', 'Default Name'),
            'Voltage__c': data.get('Voltage'),
            'Phase__c': data.get('Phase'),
            'Brand__c': data.get('Brand'),
            'Power__c': data.get('Power'),
            'Other_Specifications__c': data.get('Other Specifications'),
        }

        # Replace 'Your_Salesforce_Object__c' with your actual Salesforce object API name
        result = sf.Your_Salesforce_Object__c.create(record)
        print(f"Record created in Salesforce with ID: {result['id']}")
        return jsonify({"success": True, "record_id": result['id']}), 201
    except Exception as e:
        print(f"Error saving data to Salesforce: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
