from flask import Flask, request, jsonify
from flask_cors import CORS
from simple_salesforce import Salesforce

app = Flask(__name__)
CORS(app)

# Salesforce credentials
SF_USERNAME = 'sairamtelagamsetti@sathkrutha.sandbox'
SF_PASSWORD = 'Sairam12345@'
SF_SECURITY_TOKEN = 'FTvAU65IiITF4541K2Y5tDgi'
SF_DOMAIN = 'login'

# Initialize Salesforce connection
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

# Parsing function to map extracted data to Salesforce fields
def parse_extracted_data(data):
    """Parse the extracted data into Salesforce fields."""
    fields_mapping = {
        "Brand": "Brand__c",
        "Colour": "Colour__c",
        "Power": "Power__c",
        "Voltage": "Voltage__c",
        "Phase": "Phase__c",
        "Material": "Material__c",
        "Frequency": "Frequency__c",
        "Product Name": "Product_Name__c",
        "Usage/Application": "Usage_Application__c",
    }

    # Split the "Other Specifications" field into lines for processing
    extracted_text = data.get("Other Specifications", "")
    lines = extracted_text.split("\n")

    record = {}
    for line in lines:
        for keyword, field_name in fields_mapping.items():
            if keyword.lower() in line.lower():
                # Extract value following the keyword
                value_start_index = line.lower().find(keyword.lower()) + len(keyword)
                value = line[value_start_index:].strip()
                record[field_name] = value
                break

    # Add fallback values for required fields
    record["Name"] = data.get("Product Name", "Default Product Name")
    record["Other_Specifications__c"] = data.get("Other Specifications", "")
    return record

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
        # Parse extracted data
        record = parse_extracted_data(data)
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
