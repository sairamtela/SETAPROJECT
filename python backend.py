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

        print("Data being sent to Salesforce:", record)  # Debugging output

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
        'Brand': 'BrandName',
        'Colour': 'Red',
        'Company Name': 'Company ABC',
        'Customer Care Number': '1234567890',
        'Frequency': '50 Hz',
        'Gross Weight': '500 KG',
        'GSTIN': '27AABCU9603R1ZN',
        'Head Size': 'Large',
        'Height': '180 CM',
        'Horse Power': '5 HP',
        'Manufacture Date': '2023-12-01',
        'Material': 'Steel',
        'Model': 'Model123',
        'Motor Frame': 'Frame456',
        'Motor Type': 'Type789',
        'MRP': '20000',
        'Other Specifications': 'Special Features',
        'Phase': 'Single Phase',
        'Product Name': 'Motor XYZ',
        'Quantity': '10',
        'Ratio': '1:5',
        'Record Type ID': '0123A000000LMNOP',
        'Seller Address': '123 Main Street',
        'Serial Number': 'SN987654321',
        'Speed': '1600 RPM',
        'Stage': 'Stage 1',
        'Total Amount': '50000',
        'Usage/Application': 'Industrial',
        'Voltage': '220V',
        'Weight': '50 KG',
    }

    # Export to Salesforce
    export_to_salesforce(extracted_data)

if __name__ == "__main__":
    process_extracted_data()
