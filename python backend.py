from flask import Flask, request, jsonify
from simple_salesforce import Salesforce
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize Flask app
app = Flask(__name__)

# Salesforce credentials
SF_USERNAME = 'sairamtelagamsetti@sathkrutha.sandbox'
SF_PASSWORD = 'Sairam12345@'
SF_SECURITY_TOKEN = 'ZYaDg3Smv8Iw6PiiCW1e2Wlf'

# Initialize Salesforce connection
try:
    sf = Salesforce(username=SF_USERNAME, password=SF_PASSWORD, security_token=SF_SECURITY_TOKEN)
    logging.info("Salesforce service initialized successfully.")
except Exception as e:
    logging.error(f"Error initializing Salesforce service: {e}")
    sf = None

@app.route('/export_to_salesforce', methods=['POST'])
def create_record():
    """API endpoint to create a record in Salesforce."""
    if sf is None:
        return jsonify({"error": "Salesforce service is not initialized"}), 500

    data = request.json
    try:
        record = {
            'Product_Name__c': data.get('Product_Name__c', ''),
            'Colour__c': data.get('Colour__c', ''),
            'Motor_Type__c': data.get('Motor_Type__c', ''),
            'Frequency__c': data.get('Frequency__c', ''),
            'Gross_Weight__c': data.get('Gross_Weight__c', ''),
            'Ratio__c': data.get('Ratio__c', ''),
            'Motor_Frame__c': data.get('Motor_Frame__c', ''),
            'Model__c': data.get('Model__c', ''),
            'Speed__c': data.get('Speed__c', ''),
            'Quantity__c': data.get('Quantity__c', ''),
            'Voltage__c': data.get('Voltage__c', ''),
            'Material__c': data.get('Material__c', ''),
            'Type__c': data.get('Type__c', ''),
            'Horse_Power__c': data.get('Horse_Power__c', ''),
            'Consignee__c': data.get('Consignee__c', ''),
            'LOT__c': data.get('LOT__c', ''),
            'Stage__c': data.get('Stage__c', ''),
            'Outlet__c': data.get('Outlet__c', ''),
            'Serial_Number__c': data.get('Serial_Number__c', ''),
            'Other_Specifications__c': data.get('Other_Specifications__c', ''),
            'Total_Amount__c': data.get('Total_Amount__c', ''),
            'GSTIN__c': data.get('GSTIN__c', '')
        }

        result = sf.SETA_Invoice__c.create(record)
        logging.info(f"Created record in Salesforce: {result}")
        return jsonify({"record_id": result['id']}), 201
    except Exception as e:
        logging.error(f"Error creating record: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

