from flask import Flask, request, jsonify
from flask_cors import CORS
from simple_salesforce import Salesforce
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

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
        logging.error("Salesforce service is not initialized.")
        return jsonify({"error": "Salesforce service is not initialized"}), 500

    data = request.json
    logging.info(f"Received payload: {data}")

    if len(data) > 0:
        try:
            record = {
                'Product_Name__c': data.get('Product_Name__c', ''),
                'Colour__c': data.get('Colour__c', ''),
                'Motor_Type__c': data.get('Motor_Type__c', ''),
                'Frequency__c': data.get('Frequency__c', ''),
                'Gross_Weight__c': data.get('Gross_Weight__c', ''),
                'Ratio__c': data.get('Ratio__c', ''),
                'Other_Specifications__c': data.get('Other_Specifications__c', '')
            }
            logging.info(f"Creating record in Salesforce with data: {record}")
            result = sf.SETA_Invoice__c.create(record)
            logging.info(f"Record created successfully in Salesforce. ID: {result['id']}")
            return jsonify({"record_id": result['id']}), 201
        except Exception as e:
            logging.error(f"Error creating record in Salesforce: {e}")
            return jsonify({"error": str(e)}), 500
    else:
        logging.error("Payload is empty.")
        return jsonify({"error": "Payload is empty"}), 400

if __name__ == '__main__':
    app.run(debug=True)
