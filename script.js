from flask import Flask, request, jsonify
from simple_salesforce import Salesforce
import logging

# Configure Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Salesforce credentials
SF_USERNAME = 'sairamtelagamsetti@sathkrutha.sandbox'
SF_PASSWORD = 'Sairam12345@'
SF_SECURITY_TOKEN = 'Iy4DWr8USHwJFf8h2EzPDM1Y'

# Initialize Salesforce connection
try:
    sf = Salesforce(username=SF_USERNAME, password=SF_PASSWORD, security_token=SF_SECURITY_TOKEN)
    logging.info("Salesforce service initialized successfully.")
except Exception as e:
    logging.error(f"Error initializing Salesforce service: {e}")
    sf = None

@app.route('/export_to_salesforce', methods=['POST'])
def export_to_salesforce():
    if sf is None:
        logging.error("Salesforce service is not initialized.")
        return jsonify({"error": "Salesforce service is not initialized"}), 500

    data = request.json  # Get data from frontend
    logging.info(f"Received data from frontend: {data}")

    if not data:
        logging.error("No data received from the frontend.")
        return jsonify({"error": "No data received"}), 400

    try:
        # Map extracted data to Salesforce fields
        record = {
            'Name': data.get('Product Name', 'Default Name'),  # Default value for Name
            'Brand__c': data.get('Brand'),
            'colour__c': data.get('Colour'),
            'Company_name__c': data.get('Company Name'),
            'Customer_care_number__c': data.get('Customer Care Number'),
            'Frequency__c': data.get('Frequency'),
            'Gross_weight__c': data.get('Gross Weight'),
            'GSTIN__c': data.get('GSTIN'),
            'Head_Size__c': data.get('Head Size'),
            'Height__c': data.get('Height'),
            'Horse_power__c': data.get('Horse Power'),
            'Manufacture_date__c': data.get('Manufacture Date'),
            'Material__c': data.get('Material'),
            'Model__c': data.get('Model'),
            'Motor_Frame__c': data.get('Motor Frame'),
            'Motor_Type__c': data.get('Motor Type'),
            'MRP__c': data.get('MRP'),
            'Other_Specifications__c': data.get('Other Specifications'),
            'Phase__c': data.get('Phase'),
            'Product_Name__c': data.get('Product Name'),
            'Quantity__c': data.get('Quantity'),
            'Ratio__c': data.get('Ratio'),
            'RecordTypeId': data.get('Record Type ID'),
            'Seller_Address__c': data.get('Seller Address'),
            'Serial_number__c': data.get('Serial Number'),
            'Speed__c': data.get('Speed'),
            'Stage__c': data.get('Stage'),
            'Total_amount__c': data.get('Total Amount'),
            'Usage_Application__c': data.get('Usage/Application'),
            'Voltage__c': data.get('Voltage'),
            'Weight__c': data.get('Weight'),
        }

        logging.info(f"Data being sent to Salesforce: {record}")

        # Create record in Salesforce
        result = sf.SETA_product_details__c.create(record)
        logging.info(f"Record created successfully in Salesforce with ID: {result['id']}")
        return jsonify({"success": True, "record_id": result['id']}), 201
    except Exception as e:
        logging.error(f"Error creating record in Salesforce: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
