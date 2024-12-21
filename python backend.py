import os
import cv2
import easyocr
from simple_salesforce import Salesforce
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Salesforce credentials
SF_USERNAME = os.getenv('SF_USERNAME', 'sairamtelagamsetti@sathkrutha.sandbox')
SF_PASSWORD = os.getenv('SF_PASSWORD', 'Sairam12345@')
SF_SECURITY_TOKEN = os.getenv('SF_SECURITY_TOKEN', 'FTvAU65IiITF4541K2Y5tDgi')
SF_DOMAIN = 'login'

# Initialize Salesforce connection
try:
    sf = Salesforce(username=SF_USERNAME, password=SF_PASSWORD, security_token=SF_SECURITY_TOKEN, domain=SF_DOMAIN)
    logging.info("Salesforce service initialized successfully.")
except Exception as e:
    logging.error(f"Error initializing Salesforce service: {e}")
    sf = None


def initialize_ocr_reader():
    """Initialize EasyOCR reader."""
    try:
        reader = easyocr.Reader(['en'])
        logging.info("OCR Reader initialized.")
        return reader
    except Exception as e:
        logging.error(f"Error initializing EasyOCR Reader: {e}")
        return None


def process_ocr_text(text):
    """Process OCR text and map to predefined fields."""
    fields_mapping = {
        "Brand": "Brand__c",
        "Colour": "Colour__c",
        "Company Name": "Company_name__c",
        "Customer Care Number": "Customer_care_number__c",
        "Frequency": "Frequency__c",
        "Gross Weight": "Gross_weight__c",
        "GSTIN": "GSTIN__c",
        "Head Size": "Head_Size__c",
        "Height": "Height__c",
        "Horse Power": "Horse_power__c",
        "Manufacture Date": "Manufacture_date__c",
        "Material": "Material__c",
        "Model": "Model__c",
        "Motor Frame": "Motor_Frame__c",
        "Motor Type": "Motor_Type__c",
        "MRP": "MRP__c",
        "Other Specifications": "Other_Specifications__c",
        "Phase": "Phase__c",
        "Product Name": "Product_Name__c",
        "Quantity": "Quantity__c",
        "Ratio": "Ratio__c",
        "Seller Address": "Seller_Address__c",
        "Stage": "Stage__c",
        "Total Amount": "Total_amount__c",
        "Usage/Application": "Usage_Application__c",
        "Voltage": "Voltage__c"
    }

    extracted_data = {}
    lines = text.split("\n")

    for line in lines:
        for key, field in fields_mapping.items():
            if key in line:
                # Extract the value after the key
                value = line.split(key, 1)[-1].strip().lstrip(":").strip()
                extracted_data[field] = value

    # Log extracted data for debugging
    logging.info(f"Extracted Data: {extracted_data}")
    return extracted_data


def save_to_salesforce(data):
    """Save extracted data to Salesforce."""
    if sf is None:
        logging.error("Salesforce is not initialized. Cannot save data.")
        return None

    try:
        # Create a record with all mapped fields
        record = {
            'Brand__c': data.get("Brand__c", None),
            'Colour__c': data.get("Colour__c", None),
            'Company_name__c': data.get("Company_name__c", None),
            'Customer_care_number__c': data.get("Customer_care_number__c", None),
            'Frequency__c': data.get("Frequency__c", None),
            'Gross_weight__c': data.get("Gross_weight__c", None),
            'GSTIN__c': data.get("GSTIN__c", None),
            'Head_Size__c': data.get("Head_Size__c", None),
            'Height__c': data.get("Height__c", None),
            'Horse_power__c': data.get("Horse_power__c", None),
            'Manufacture_date__c': data.get("Manufacture_date__c", None),
            'Material__c': data.get("Material__c", None),
            'Model__c': data.get("Model__c", None),
            'Motor_Frame__c': data.get("Motor_Frame__c", None),
            'Motor_Type__c': data.get("Motor_Type__c", None),
            'MRP__c': data.get("MRP__c", None),
            'Other_Specifications__c': data.get("Other_Specifications__c", None),
            'Phase__c': data.get("Phase__c", None),
            'Product_Name__c': data.get("Product_Name__c", None),
            'Quantity__c': data.get("Quantity__c", None),
            'Ratio__c': data.get("Ratio__c", None),
            'Seller_Address__c': data.get("Seller_Address__c", None),
            'Stage__c': data.get("Stage__c", None),
            'Total_amount__c': data.get("Total_amount__c", None),
            'Usage_Application__c': data.get("Usage_Application__c", None),
            'Voltage__c': data.get("Voltage__c", None),
            'Name': data.get("Product_Name__c", "Default Name")  # Default Name if none
        }

        # Create the record in Salesforce
        result = sf.SETA_product_details__c.create(record)
        logging.info(f"Record created in Salesforce: {result['id']}")
        return result
    except Exception as e:
        logging.error(f"Error saving data to Salesforce: {e}")
        return None


def main():
    # Initialize OCR Reader
    reader = initialize_ocr_reader()
    if not reader:
        logging.error("OCR Reader initialization failed. Exiting...")
        return

    # Capture Image (Simulated here; use actual image capture in production)
    image_path = "captured_image.png"  # Replace with your captured image path
    if not os.path.exists(image_path):
        logging.error("Image file does not exist. Exiting...")
        return

    # Perform OCR
    results = reader.readtext(image_path, detail=0)
    text = "\n".join(results)
    logging.info(f"OCR Text: {text}")

    # Process OCR text
    extracted_data = process_ocr_text(text)

    # Save to Salesforce
    if extracted_data:
        save_to_salesforce(extracted_data)
    else:
        logging.error("No valid data extracted to save to Salesforce.")


if __name__ == "__main__":
    main()
