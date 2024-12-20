import easyocr
import re
import os
from simple_salesforce import Salesforce
import logging

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

def initialize_reader():
    try:
        reader = easyocr.Reader(['en'])
        return reader
    except Exception as e:
        logging.error("Error initializing EasyOCR Reader: %s", e)
        return None

def load_image(image_path):
    if not os.path.exists(image_path):
        logging.error(f"The image path '{image_path}' does not exist.")
        return None
    try:
        logging.info(f"Loading image from: {image_path}")
        return image_path
    except Exception as e:
        logging.error("Error loading image: %s", e)
        return None

def perform_ocr(reader, image_path):
    try:
        results = reader.readtext(image_path)
        extracted_text = "\n".join([result[1] for result in results])
        logging.info("OCR extraction completed.")
        return extracted_text
    except Exception as e:
        logging.error("Error performing OCR: %s", e)
        return ""

def extract_structured_data(text):
    structured_data = {}
    patterns = {
        "Model": r"Model\s*[:;-]\s*(.*?)\s*kW",
        "Voltage": r"Voltage\s*[:;-]\s*(.*?)\s*V",
        "End Use": r"End\s*Use\s*[:;-]\s*(.*?)(?=\n)",
        "Motor Phase": r"Phase\s*[:;-]\s*(\w+)",
        "Brand": r"Brand\s*[:;-]\s*(.*?)\n",
        "Power": r"Power\s*[:;-]\s*(\d+HP)",
        "Specifications": r"Specifications\s*[:;-]\s*(.*?)(?=\n)"
    }

    for field, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            structured_data[field] = match.group(1).strip()

    return structured_data

def create_motor_record_in_salesforce(data):
    if sf is None:
        logging.error("Salesforce service is not initialized. Cannot create motor records.")
        return

    try:
        record = {
            'Model__c': data.get('Model'),
            'Voltage__c': data.get('Voltage'),
            'Type_of_End_Use__c': data.get('End Use'),
            'Motor_Phase__c': data.get('Motor Phase'),
            'Brand__c': data.get('Brand'),
            'Power__c': data.get('Power'),
            'Other_Specifications__c': data.get('Specifications')
        }
        result = sf.SETA_product_details__c.create(record)
        logging.info(f"Created motor record in Salesforce with ID: {result['id']}")
        print(f"Record created successfully. Record ID: {result['id']}")
    except Exception as e:
        logging.error(f"Error creating motor record in Salesforce: {e}")

def main():
    image_path = "image.png"  # Replace with the path to your image

    reader = initialize_reader()
    if not reader:
        return

    if not load_image(image_path):
        return

    extracted_text = perform_ocr(reader, image_path)
    if not extracted_text:
        return

    structured_data = extract_structured_data(extracted_text)
    if not structured_data:
        logging.error("No structured data extracted from OCR results.")
        return

    logging.info("Structured Data:")
    for key, value in structured_data.items():
        logging.info(f"{key}: {value}")

    create_motor_record_in_salesforce(structured_data)

if __name__ == "__main__":
    main()
