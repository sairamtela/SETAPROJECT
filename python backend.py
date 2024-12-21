import os
from simple_salesforce import Salesforce
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Salesforce credentials
SF_USERNAME = os.getenv('sairamtelagamsetti@sathkrutha.sandbox')  # Replace with your username
SF_PASSWORD = os.getenv('Sairam12345@')  # Replace with your password
SF_SECURITY_TOKEN = os.getenv('FTvAU65IiITF4541K2Y5tDgi')  # Replace with your security token

# Initialize Salesforce connection
try:
    sf = Salesforce(username=SF_USERNAME, password=SF_PASSWORD, security_token=SF_SECURITY_TOKEN)
    logging.info("Salesforce service initialized successfully.")
except Exception as e:
    logging.error(f"Error initializing Salesforce service: {e}")
    sf = None

def create_record_in_salesforce(data):
    """Creates a record in Salesforce with provided data."""
    if sf is None:
        logging.error("Salesforce service is not initialized. Cannot create records.")
        return
    try:
        record = {
            'Brand__c': data.get('Brand', 'Default Brand'),
            'colour__c': data.get('Colour', 'Default Colour'),
            'Company_name__c': data.get('Company Name', 'Default Company'),
            'Customer_care_number__c': data.get('Customer Care Number', None),
            'Frequency__c': data.get('Frequency', None),
            'Gross_weight__c': data.get('Gross Weight', None),
            'GSTIN__c': data.get('GSTIN', None),
            'Head_Size__c': data.get('Head Size', None),
            'Height__c': data.get('Height', None),
            'Horse_power__c': data.get('Horse Power', None),
            'Manufacture_date__c': data.get('Manufacture Date', None),
            'Material__c': data.get('Material', None),
            'Model__c': data.get('Model', None),
            'Motor_Frame__c': data.get('Motor Frame', None),
            'Motor_Type__c': data.get('Motor Type', None),
            'MRP__c': data.get('MRP', None),
            'Other_Specifications__c': data.get('Other Specifications', None),
            'Phase__c': data.get('Phase', None),
            'Product_Name__c': data.get('Product Name', 'Default Product'),
            'Quantity__c': data.get('Quantity', None),
            'Ratio__c': data.get('Ratio', None),
            'Seller_Address__c': data.get('Seller Address', None),
            'Stage__c': data.get('Stage', None),
            'Total_amount__c': data.get('Total Amount', None),
            'Usage_Application__c': data.get('Usage/Application', None),
            'Voltage__c': data.get('Voltage', None),
            'Name': data.get('Name', 'Default Name')  # Required field in Salesforce
        }
        logging.info(f"Data to save: {record}")

        # Replace 'Your_Salesforce_Object__c' with the actual object name
        result = sf.Your_Salesforce_Object__c.create(record)
        logging.info(f"Record created in Salesforce with ID: {result['id']}")
    except Exception as e:
        logging.error(f"Error creating record in Salesforce: {e}")

def main():
    """Main function to execute the Salesforce integration."""
    # Example extracted data (this would come from your OCR or input source)
    extracted_data = {
        "Brand": "Kirloskar",
        "Colour": "Blue",
        "Company Name": "Example Company",
        "Customer Care Number": "1234567890",
        "Frequency": "50Hz",
        "Gross Weight": "20kg",
        "GSTIN": "22AAAAA0000A1Z5",
        "Head Size": "10cm",
        "Height": "50cm",
        "Horse Power": "5HP",
        "Manufacture Date": "2023-01-01",
        "Material": "Steel",
        "Model": "AV1XL",
        "Motor Frame": "Frame123",
        "Motor Type": "Induction",
        "MRP": "5000.00",
        "Other Specifications": "Automation Grade",
        "Phase": "Single",
        "Product Name": "Electric Motor",
        "Quantity": "10",
        "Ratio": "10:1",
        "Seller Address": "123, Industrial Road, City",
        "Stage": "Completed",
        "Total Amount": "50000.00",
        "Usage/Application": "Agricultural",
        "Voltage": "220V",
        "Name": "Motor123"
    }

    # Create a record in Salesforce
    create_record_in_salesforce(extracted_data)

if __name__ == "__main__":
    main()
