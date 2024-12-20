import easyocr
import re
import os
import pandas as pd
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
        print("OCR Extracted Text:", extracted_text)
        return extracted_text
    except Exception as e:
        logging.error("Error performing OCR: %s", e)
        return ""

def extract_structured_data(text):
    structured_data = {}
    patterns = {
        "Name": r"Name\s*[:;-]\s*(.*?)\s*$",
        "Speed": r"Speed\s*[:;-]\s*(.*?)\s*$",
        "Stage": r"Stage\s*[:;-]\s*(.*?)\s*$",
        "Total Amount": r"Total Amount\s*[:;-]\s*(.*?)\s*$",
        "Usage/Application": r"Usage/Application\s*[:;-]\s*(.*?)\s*$",
        "Voltage": r"Voltage\s*[:;-]\s*(.*?)\s*V",
        "Weight": r"Weight\s*[:;-]\s*(.*?)\s*$",
        "Serial Number": r"Serial Number\s*[:;-]\s*(.*?)\s*$",
        "Seller Address": r"Seller Address\s*[:;-]\s*(.*?)\s*$"
    }

    for field, pattern in patterns.items():
        match = re.search(pattern, text, re.MULTILINE)
        if match:
            structured_data[field] = match.group(1).strip()

    print("Structured Data Extracted:", structured_data)
    return structured_data

def save_to_excel(data, file_name="extracted_data.xlsx"):
    try:
        df = pd.DataFrame([data])
        df.to_excel(file_name, index=False)
        logging.info(f"Data saved to Excel file: {file_name}")
        print(f"Data saved to Excel: {file_name}")
    except Exception as e:
        logging.error(f"Error saving data to Excel: {e}")

def read_excel_and_export_to_salesforce(file_name="extracted_data.xlsx"):
    if sf is None:
        logging.error("Salesforce service is not initialized. Cannot create motor records.")
        return

    try:
        df = pd.read_excel(file_name)
        for index, row in df.iterrows():
            record = {
                'Name': row.get('Name'),
                'Speed__c': row.get('Speed'),
                'Stage__c': row.get('Stage'),
                'Total_amount__c': row.get('Total Amount'),
                'Usage_Application__c': row.get('Usage/Application'),
                'Voltage__c': row.get('Voltage'),
                'Weight__c': row.get('Weight'),
                'Serial_number__c': row.get('Serial Number'),
                'Seller_Address__c': row.get('Seller Address')
            }
            result = sf.SETA_product_details__c.create(record)
            logging.info(f"Created motor record in Salesforce with ID: {result['id']}")
            print(f"Record created successfully. Record ID: {result['id']}")
    except Exception as e:
        logging.error(f"Error creating motor record in Salesforce: {e}")
        if hasattr(e, 'content'):
            print(f"Salesforce error content: {e.content}")

def main():
    image_path = "/mnt/data/image.png"  # Replace with the path to your uploaded image

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

    save_to_excel(structured_data)
    # Call the export function to upload data from Excel to Salesforce
    read_excel_and_export_to_salesforce()

if __name__ == "__main__":
    main()
