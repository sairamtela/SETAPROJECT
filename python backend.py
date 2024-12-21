import easyocr
import re
import os

# Initialize EasyOCR Reader
def initialize_reader():
    try:
        reader = easyocr.Reader(['en'])
        return reader
    except Exception as e:
        print("Error initializing EasyOCR Reader:", e)
        return None

# Load and Process the Image
def load_image(image_path):
    if not os.path.exists(image_path):
        print(f"Error: The image path '{image_path}' does not exist.")
        return None
    try:
        print(f"Loading image from: {image_path}")
        return image_path
    except Exception as e:
        print("Error loading image:", e)
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

# Function to Extract Structured Data
def extract_structured_data(text):
    structured_data = {}
    lines = text.split("\n")

    # Assign the first line as the Product Name
    if lines:
        structured_data["Product Name"] = lines[0].strip()

    # Patterns for extracting data
    patterns = {
        "Company Name": r"(?i)(Company Name|Company):\s*(.*)",
        "Address": r"(?i)(Address):\s*(.*)",
        "Phone": r"(?i)(Phone|Contact):\s*(\+?\d{10,15})",
        "GSTIN": r"(?i)(GSTIN):\s*([A-Z0-9]+)",
        "PAN Number": r"(?i)(PAN\s*Number|PAN):\s*([A-Z]{5}[0-9]{4}[A-Z])",
        "Invoice Number": r"(?i)(Invoice\s*Number|Invoice No):\s*(\d+)",
        "Invoice Date": r"(?i)(Invoice\s*Date|Date):\s*(.*)"
        "Product Name": r"Product\s*[:;-]\s*(.*?)(?=\||Total|\n)",
        "Model": r"Model\s*[:;-]\s*(.*?)\s*kW",
        "kW / HP": r"kW\s*/\s*HP\s*:\s*([\d./]+)",
        "Phase": r"Phase\s*:\s*(\w+)",
        "Speed": r"Speed\s*:\s*(\d+\s*RPM)",
        "Net Quantity": r"Net\s*Quantity\s*:\s*(\S+)",
        "Gross Weight": r"Gross\s*Weight\s*:\s*([\d.]+\s*\w+)",
        "Month & Year of MFG": r"Month\s*&\s*Year\s*of\s*MFG\s*:\s*(\w+\s*\d+)",
        "MRP": r"MRP.*?([\d.,]+\s*\(Inclusive\s*of\s*.*?\))",
        "Serial No.": r"Serial\s*No\s*[:;-]\s*(.*?)\|",
        "Manufacturer": r"Sold\s*By\s*[:;-]\s*(.*?)(?=,|\n)",
        "Address": r"DELIVERY\s*ADDRESS[:;-]\s*(.*?)(?=\s*Courler|\n)",
        "Customer Care": r"Customer\s*Care\s*[:;-]\s*(\+?\d+)",
        "Email": r"Email\s*[:;-]\s*(\S+)",
        "Name": r"Name\s*[:;-]\s*(.*?)(?=Model|Date|$)",
        "Date": r"Date\s*[:;-]\s*([0-9-/]+)",
        "Tracking ID": r"Courler\s*AWB\s*No\s*[:;-]\s*(\S+)",
        "GSTIN": r"GSTIN\s*No\s*[:;-]\s*([A-Z0-9]+)"
    }

    # Match patterns in text
    for field, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            value = match.group(2).strip() if len(match.groups()) > 1 else match.group(1).strip()
            structured_data[field] = value

    return structured_data

# Main Execution
def main():
    # Path to the image
    image_path = "image.png"  # Replace with the correct path to your image

    # Initialize EasyOCR Reader
    reader = initialize_reader()
    if not reader:
        return

    # Load the Image
    if not load_image(image_path):
        return

    # Perform OCR
    extracted_text = perform_ocr(reader, image_path)
    if not extracted_text:
        return

    # Extract Structured Data
    structured_data = extract_structured_data(extracted_text)

    # Print Structured Data
    print("\nStructured Data:")
    if structured_data:
        for key, value in structured_data.items():
            print(f"{key}: {value}")
    else:
        print("No valid data found in the extracted text.")

# Run the Script
if __name__ == "__main__":
    main()
