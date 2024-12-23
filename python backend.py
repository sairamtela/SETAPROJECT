from flask import Flask, request, jsonify
from openpyxl import Workbook
from simple_salesforce import Salesforce
from dotenv import load_dotenv
import os
import logging

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Salesforce credentials (use environment variables for security in production)
SF_USERNAME = "sairamtelagamsetti@sathkrutha.sandbox"
SF_PASSWORD = "Sairam12345@"
SF_SECURITY_TOKEN = "ZYaDg3Smv8Iw6PiiCW1e2Wlf"

# Initialize Salesforce connection
try:
    sf = Salesforce(username=SF_USERNAME, password=SF_PASSWORD, security_token=SF_SECURITY_TOKEN)
    logging.info("Salesforce service initialized successfully.")
except Exception as e:
    logging.error(f"Error initializing Salesforce service: {e}")
    sf = None

def create_product_record_in_salesforce(data):
    """
    Creates a record in Salesforce for a product in the SETA_product_details__c object.
    Raises an exception if Salesforce connection is not initialized or if record creation fails.
    """
    if sf is None:
        raise Exception("Salesforce connection not initialized.")

    record = {
        'Brand__c': data.get('Brand', 'N/A'),
        'colour__c': data.get('Colour', 'N/A'),
        'Company_name__c': data.get('Company Name', 'N/A'),
        'Customer_care_number__c': data.get('Customer Care Number', 'N/A'),
        'Frequency__c': data.get('Frequency', 'N/A'),
        'Gross_weight__c': data.get('Gross Weight', 'N/A'),
        'GSTIN__c': data.get('GSTIN', 'N/A'),
        'Head_Size__c': data.get('Head Size', 'N/A'),
        'Height__c': data.get('Height', 'N/A'),
        'Horse_power__c': data.get('Horse Power', 'N/A'),
        'Manufacture_date__c': data.get('Manufacture Date', 'N/A'),
        'Material__c': data.get('Material', 'N/A'),
        'Model__c': data.get('Model', 'N/A'),
        'Motor_Frame__c': data.get('Motor Frame', 'N/A'),
        'Motor_Type__c': data.get('Motor Type', 'N/A'),
        'MRP__c': data.get('MRP', 'N/A'),
        'Other_Specifications__c': data.get('Other Specifications', 'N/A'),
        'Phase__c': data.get('Phase', 'N/A'),
        'Product_Name__c': data.get('Product Name', 'N/A'),
        'Quantity__c': data.get('Quantity', 'N/A'),
        'Ratio__c': data.get('Ratio', 'N/A'),
        'Seller_Address__c': data.get('Seller Address', 'N/A'),
        'Stage__c': data.get('Stage', 'N/A'),
        'Total_amount__c': data.get('Total Amount', 'N/A'),
        'Usage_Application__c': data.get('Usage/Application', 'N/A'),
        'Voltage__c': data.get('Voltage', 'N/A'),
    }

    try:
        result = sf.SETA_product_details__c.create(record)
        return result
    except Exception as e:
        logging.error(f"Failed to create Salesforce record: {e}")
        raise

def save_to_excel(data, file_name="SETA_product_data.xlsx"):
    """
    Saves the data to an Excel file.
    """
    try:
        wb = Workbook()
        ws = wb.active
        ws.title = "Product Data"

        # Add headers and data
        headers = [
            'Brand', 'Colour', 'Company Name', 'Customer Care Number', 'Frequency',
            'Gross Weight', 'GSTIN', 'Head Size', 'Height', 'Horse Power',
            'Manufacture Date', 'Material', 'Model', 'Motor Frame', 'Motor Type',
            'MRP', 'Other Specifications', 'Phase', 'Product Name', 'Quantity',
            'Ratio', 'Seller Address', 'Stage', 'Total Amount', 'Usage/Application',
            'Voltage'
        ]
        ws.append(headers)
        ws.append([
            data.get('Brand', 'N/A'),
            data.get('Colour', 'N/A'),
            data.get('Company Name', 'N/A'),
            data.get('Customer Care Number', 'N/A'),
            data.get('Frequency', 'N/A'),
            data.get('Gross Weight', 'N/A'),
            data.get('GSTIN', 'N/A'),
            data.get('Head Size', 'N/A'),
            data.get('Height', 'N/A'),
            data.get('Horse Power', 'N/A'),
            data.get('Manufacture Date', 'N/A'),
            data.get('Material', 'N/A'),
            data.get('Model', 'N/A'),
            data.get('Motor Frame', 'N/A'),
            data.get('Motor Type', 'N/A'),
            data.get('MRP', 'N/A'),
            data.get('Other Specifications', 'N/A'),
            data.get('Phase', 'N/A'),
            data.get('Product Name', 'N/A'),
            data.get('Quantity', 'N/A'),
            data.get('Ratio', 'N/A'),
            data.get('Seller Address', 'N/A'),
            data.get('Stage', 'N/A'),
            data.get('Total Amount', 'N/A'),
            data.get('Usage/Application', 'N/A'),
            data.get('Voltage', 'N/A'),
        ])

        # Save file
        file_path = os.path.join(os.getcwd(), file_name)
        wb.save(file_path)
        logging.info(f"Data saved to Excel file at {file_path}")
        return file_path
    except Exception as e:
        logging.error(f"Error saving data to Excel: {e}")
        raise

@app.route('/export', methods=['POST'])
def export_data():
    """
    Endpoint to process data, save it to Salesforce, and write to an Excel file.
    """
    try:
        data = request.json
        logging.info(f"Received data: {data}")

        # Step 1: Create a Salesforce record
        try:
            sf_result = create_product_record_in_salesforce(data)
            salesforce_id = sf_result['id']
            logging.info(f"Record created in Salesforce with ID: {salesforce_id}")
        except Exception as e:
            return jsonify({'error': f"Salesforce Error: {e}"}), 500

        # Step 2: Save data to Excel
        try:
            file_path = save_to_excel(data)
        except Exception as e:
            return jsonify({'error': f"Excel Error: {e}"}), 500

        # Return success response
        return jsonify({
            'salesforce_id': salesforce_id,
            'message': 'Export successful.',
            'excel_file_path': file_path
        }), 200

    except Exception as e:
        logging.error(f"Error processing export: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
