import easyocr
import re
import os

# Initialize EasyOCR Reader
def initialize_reader():
    try:
        reader = easyocr.Reader(['en'], gpu=False)
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

    # Assign the first line as the Product Name if it exists
    if lines:
        structured_data["Product Name"] = lines[0].strip()

    # Patterns for extracting specific fields
    patterns = {
        "Company Name": r"(?i)Company Name\s*[:;-]?\s*(.*)",
        "Address": r"(?i)Address\s*[:;-]?\s*(.*)",
        "Phone": r"(?i)(Phone|Contact)\s*[:;-]?\s*(\+?\d{10,15})",
        "GSTIN": r"(?i)GSTIN\s*[:;-]?\s*([A-Z0-9]+)",
        "PAN Number": r"(?i)PAN\s*Number\s*[:;-]?\s*([A-Z]{5}[0-9]{4}[A-Z])",
        "Invoice Number": r"(?i)Invoice\s*Number\s*[:;-]?\s*(\d+)",
        "Invoice Date": r"(?i)Invoice\s*Date\s*[:;-]?\s*(.*)",
        "Model": r"(?i)Model\s*[:;-]?\s*(.*)",
        "Power Rating": r"(?i)Power Rating\s*[:;-]?\s*(.*)",
        "Motor Phase": r"(?i)Motor Phase\s*[:;-]?\s*(.*)",
        "Country of Origin": r"(?i)Country of Origin\s*[:;-]?\s*(.*)",
        "Minimum Order Quantity": r"(?i)Minimum Order Quantity\s*[:;-]?\s*(.*)",
    }

    # Extract data based on patterns
    for field, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            structured_data[field] = match.group(1).strip()

    # Add remaining text to "Other Specifications"
    remaining_text = "\n".join(lines)
    structured_data["Other Specifications"] = remaining_text.strip()

    return structured_data

# Main Execution
def main():
    # Path to the image
    image_path = "image.png"  # Replace with the path to your image

    # Initialize EasyOCR Reader
    reader = initialize_reader()
    if not reader:
        return

    # Load the Image
    loaded_image = load_image(image_path)
    if not loaded_image:
        return

    # Perform OCR
    extracted_text = perform_ocr(reader, loaded_image)
    if not extracted_text.strip():
        print("No text detected!")
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
