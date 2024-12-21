import easyocr
import re
import os
from simple_salesforce import Salesforce

# Salesforce Connection Details
SF_USERNAME = "sairamtelagamsetti@sathkrutha.sandbox"
SF_PASSWORD = "Sairam12345@"
SF_SECURITY_TOKEN = "FTvAU65IiITF4541K2Y5tDgi"

# Initialize Salesforce Connection
def connect_to_salesforce():
    try:
        sf = Salesforce(username=SF_USERNAME, password=SF_PASSWORD, security_token=SF_SECURITY_TOKEN)
        print("Connected to Salesforce successfully.")
        return sf
    except Exception as e:
        print("Error connecting to Salesforce:", e)
        return None

# Insert Data into Salesforce
def insert_data_to_salesforce(sf, data):
    try:
        # Custom Object API Name: SETA_product_details__c
        response = sf.SETA_product_details__c.create(data)
        print("Record inserted successfully:", response)
    except Exception as e:
        print("Error inserting data into Salesforce:", e)

# Initialize EasyOCR Reader
def initialize_reader():
    try:
        reader = easyocr.Reader(['en'])
        return reader
    except Exception as e:
        print("Error initializing EasyOCR Reader:", e)
        return None

# Perform OCR on the Image
def perform_ocr(reader, image_path):
    try:
        results = reader.readtext(image_path)
        extracted_text = "\n".join([result[1] for result in results])
        print("\nFull Extracted Text:")
        print(extracted_text)
        return extracted_text
    except Exception as e:
        print("Error performing OCR:", e)
        return ""

# Extract Structured Data
def extract_structured_data(text):
    structured_data = {}
    lines = text.split("\n")
    unmatched_lines = []

    # Patterns for extracting data
    patterns = {
        "Model__c": r"(?i)(Model|Model Name|Model Number)[:;\-\s]*(.+)",
        "Voltage__c": r"(?i)(Voltage)[:;\-\s]*(\d+\s*V)",
        "Type__c": r"(?i)(Type)[:;\-\s]*(.+)",
        "Phase__c": r"(?i)(Phase|Motor Phase)[:;\-\s]*(.+)",
        "Brand__c": r"(?i)(Brand)[:;\-\s]*(.+)",
        "Power__c": r"(?i)(Power|Horsepower)[:;\-\s]*(.+)",
    }

    # Match patterns in text
    matched_lines = []
    for line in lines:
        matched = False
        for field, pattern in patterns.items():
            match = re.search(pattern, line)
            if match:
                value = match.group(2).strip() if len(match.groups()) > 1 else match.group(1).strip()
                if value:  # Add only if value is non-empty
                    structured_data[field] = value
                    matched_lines.append(line)
                    matched = True
                break
        if not matched and line.strip():  # Line does not match any attribute
            unmatched_lines.append(line.strip())

    # Add "Other_Specifications__c" for unmatched lines
    if unmatched_lines:
        structured_data["Other_Specifications__c"] = "; ".join(unmatched_lines)

    return structured_data

# Main Execution
def main():
    # Path to the image
    image_path = "image.png"  # Replace with the correct path to your image

    # Initialize EasyOCR Reader
    reader = initialize_reader()
    if not reader:
        return

    # Perform OCR
    extracted_text = perform_ocr(reader, image_path)
    if not extracted_text:
        return

    # Extract Structured Data
    structured_data = extract_structured_data(extracted_text)
    print("\nStructured Data to Insert:")
    print(structured_data)

    # Connect to Salesforce
    sf = connect_to_salesforce()
    if not sf:
        return

    # Insert Data into Salesforce
    insert_data_to_salesforce(sf, structured_data)

# Run the Script
if __name__ == "__main__":
    main()

