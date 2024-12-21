import os
import re
import easyocr
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
SF_DOMAIN = 'login'  # Specify Salesforce domain

# Initialize Salesforce connection
try:
    sf = Salesforce(username=SF_USERNAME, password=SF_PASSWORD, security_token=SF_SECURITY_TOKEN, domain=SF_DOMAIN)
    logging.info("Salesforce service initialized successfully.")
except Exception as e:
    logging.error(f"Error initializing Salesforce service: {e}")
    sf = None

# Initialize EasyOCR Reader
def initialize_reader():
    try:
        reader = easyocr.Reader(['en'])
        return reader
    except Exception as e:
        logging.error(f"Error initializing EasyOCR Reader: {e}")
        return None

# Perform OCR on the Image
def perform_ocr(reader, image_path):
    try:
        results = reader.readtext(image_path)
        extracted_text = "\n".join([result[1] for result in results])
        logging.info("OCR completed successfully.")
        return extracted_text
    except Exception as e:
        logging.error(f"Error performing OCR: {e}")
        return ""

# Extract Structured Data
def extract_structured_data(text):
    structured_data = {}
    patterns = {
        "Product Name": r"Product\s*[:;-]\s*(.*?)(?=\||Total|\n)",
        "Company Name": r"(?i)(Company Name|Company):\s*(.*)",
        "Address": r"(?i)(Address):\s*(.*)",
        "Phone": r"(?i)(Phone|Contact):\s*(\+?\d{10,15})",
        "GSTIN": r"(?i)(GSTIN):\s*([A-Z0-9]+)",
        "Invoice Number": r"(?i)(Invoice\s*Number|Invoice No):\s*(\d+)",
        "Model": r"Model\s*[:;-]\s*(.*?)\s*kW",
        "kW / HP": r"kW\s*/\s*HP\s*:\s*([\d./]+)",
        "Phase": r"Phase\s*:\s*(\w+)",
        "Speed": r"Speed\s*:\s*(\d+\s*RPM)",
        "Gross Weight": r"Gross\s*Weight\s*:\s*([\d.]+\s*\w+)",
        "MRP": r"MRP.*?([\d.,]+\s*\(Inclusive\s*of\s*.*?\))",
        "Serial Number": r"Serial\s*No\s*[:;-]\s*(.*?)\|",
        "Manufacturer": r"Sold\s*By\s*[:;-]\s*(.*?)(?=,|\n)"
    }

    for field, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            structured_data[field] = match.group(1).strip()

    return structured_data

# Export Data to Salesforce
@app.route('/export_to_salesforce', methods=['POST'])
def export_to_salesforce():
    if sf is None:
        return jsonify({"error": "Salesforce service is not initialized"}), 500

    # Get data from frontend
    data = request.json
    if not data:
        return jsonify({"error": "No data received"}), 400

    try:
        # Map extracted data to Salesforce fields
        record = {
            'Name': data.get('Product Name', 'Default Name'),
            'Company_name__c': data.get('Company Name'),
            'Gross_weight__c': data.get('Gross Weight'),
            'GSTIN__c': data.get('GSTIN'),
            'Serial_number__c': data.get('Serial Number'),
            'MRP__c': data.get('MRP'),
            'Phase__c': data.get('Phase'),
            'Speed__c': data.get('Speed'),
            'Model__c': data.get('Model'),
        }

        # Create record in Salesforce
        result = sf.SETA_product_details__c.create(record)
        logging.info(f"Created record in Salesforce with ID: {result['id']}")
        return jsonify({"success": True, "record_id": result['id']}), 201
    except Exception as e:
        logging.error(f"Error creating record in Salesforce: {e}")
        return jsonify({"error": str(e)}), 500

# Process Image and Extract Data
@app.route('/process_image', methods=['POST'])
def process_image():
    image_path = request.json.get('image_path')
    if not os.path.exists(image_path):
        return jsonify({"error": f"Image path '{image_path}' does not exist"}), 400

    reader = initialize_reader()
    if not reader:
        return jsonify({"error": "Failed to initialize OCR reader"}), 500

    # Perform OCR
    extracted_text = perform_ocr(reader, image_path)
    if not extracted_text:
        return jsonify({"error": "Failed to extract text from image"}), 500

    # Extract Structured Data
    structured_data = extract_structured_data(extracted_text)
    return jsonify({"structured_data": structured_data}), 200

if __name__ == '__main__':
    app.run(debug=True)
