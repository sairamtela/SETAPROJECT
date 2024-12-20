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

def export_to_salesforce(data):
    """Function to export extracted data to Salesforce."""
    if sf is None:
        logging.error("Salesforce service is not initialized. Cannot create motor records.")
        return

    try:
        # Map extracted data to Salesforce fields
        record = {
            'Speed__c': data.get('Speed'),
            'Phase__c': data.get('Phase'),
            'Other_Specifications__c': data.get('Other Specifications'),
            'Type__c': data.get('Type'),
            'RPM__c': data.get('RPM'),
        }
        
        # Create record in Salesforce
        result = sf.SETA_product_details__c.create(record)
        logging.info(f"Created motor record in Salesforce with ID: {result['id']}")
        print(f"Record created successfully. Record ID: {result['id']}")
    except Exception as e:
        logging.error(f"Error creating motor record in Salesforce: {e}")
        if hasattr(e, 'content'):
            print(f"Salesforce error content: {e.content}")

def process_extracted_data():
    """Simulated function to process extracted data."""
    # Example data extracted from UI
    extracted_data = {
        'Speed': 'Motor Speed 1600 RPM',
        'Type': 'Engine Type 4 Stroke',
        'Phase': 'Motor Phase Single Phase',
        'RPM': 'Motor Speed 1600 RPM',
        'Other Specifications': 'OV 5 HP wer Source Diesel Voltage 220 V Frequency 50 Hz Material Mild Steel',
    }

    # Export to Salesforce
    export_to_salesforce(extracted_data)

if __name__ == "__main__":
    process_extracted_data()
