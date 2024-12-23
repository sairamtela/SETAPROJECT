from flask import Flask, request, jsonify
from openpyxl import Workbook
from simple_salesforce import Salesforce
from dotenv import load_dotenv
import os
import logging

app = Flask(__name__)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Salesforce credentials
SF_USERNAME = os.getenv('SF_USERNAME')
SF_PASSWORD = os.getenv('SF_PASSWORD')
SF_SECURITY_TOKEN = os.getenv('SF_SECURITY_TOKEN')

# Initialize Salesforce connection
try:
    sf = Salesforce(username=SF_USERNAME, password=SF_PASSWORD, security_token=SF_SECURITY_TOKEN)
    logging.info("Salesforce service initialized successfully.")
except Exception as e:
    logging.error(f"Error initializing Salesforce service: {e}")
    sf = None

def create_motor_record_in_salesforce(data):
    """Creates a record in Salesforce for an electric motor."""
    if sf is None:
        raise Exception("Salesforce connection not initialized.")

    record = {
        'Model__c': data.get('Model', 'N/A'),
        'Voltage__c': data.get('Voltage', 'N/A'),
        'Type_of_End_Use__c': data.get('End Use', 'N/A'),
        'Motor_Phase__c': data.get('Motor Phase', 'N/A'),
        'Brand__c': data.get('Brand', 'N/A'),
        'Power__c': data.get('Power', 'N/A'),
        'Other_Specifications__c': data.get('Specifications', 'N/A'),
    }

    return sf.ElectricMotor__c.create(record)

@app.route('/export', methods=['POST'])
def export_data():
    try:
        data = request.json
        logging.info(f"Received data: {data}")

        # Salesforce integration
        try:
            sf_result = create_motor_record_in_salesforce(data)
            salesforce_id = sf_result['id']
            logging.info(f"Record created in Salesforce with ID: {salesforce_id}")
        except Exception as e:
            logging.error(f"Salesforce Error: {e}")
            return jsonify({'error': f"Salesforce Error: {e}"}), 500

        # Excel file creation
        try:
            wb = Workbook()
            ws = wb.active
            ws.title = "Motor Data"

            # Add headers and data
            headers = ['Model', 'Voltage', 'End Use', 'Motor Phase', 'Brand', 'Power', 'Specifications']
            ws.append(headers)
            ws.append([
                data.get('Model', 'N/A'),
                data.get('Voltage', 'N/A'),
                data.get('End Use', 'N/A'),
                data.get('Motor Phase', 'N/A'),
                data.get('Brand', 'N/A'),
                data.get('Power', 'N/A'),
                data.get('Specifications', 'N/A'),
            ])

            # Save Excel file
            file_path = os.path.join(os.getcwd(), 'motor_data.xlsx')
            wb.save(file_path)
            logging.info(f"Data saved to Excel file at {file_path}")
        except Exception as e:
            logging.error(f"Excel Error: {e}")
            return jsonify({'error': f"Excel Error: {e}"}), 500

        return jsonify({'salesforce_id': salesforce_id, 'message': 'Export successful.'}), 200

    except Exception as e:
        logging.error(f"Error processing export: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
