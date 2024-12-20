import easyocr
import re
import os
import cv2
import numpy as np

# Initialize EasyOCR Reader
def initialize_reader():
    try:
        reader = easyocr.Reader(['en'])
        return reader
    except Exception as e:
        print("Error initializing EasyOCR Reader:", e)
        return None

# Preprocess Image for Better OCR
def preprocess_image(image_path):
    try:
        # Load image in grayscale
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        # Resize image for better OCR
        img = cv2.resize(img, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
        # Apply Gaussian Blur
        img = cv2.GaussianBlur(img, (5, 5), 0)
        # Apply Thresholding
        _, img = cv2.threshold(img, 150, 255, cv2.THRESH_BINARY)
        # Save preprocessed image (optional)
        preprocessed_path = "preprocessed_image.png"
        cv2.imwrite(preprocessed_path, img)
        return preprocessed_path
    except Exception as e:
        print("Error preprocessing image:", e)
        return image_path

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
    patterns = {
        "Model Name/Number": r"(?i)(Model Name/Number)\s*[:;-]\s*(.*)",
        "Type": r"(?i)(Type)\s*[:;-]\s*(.*)",
        "Motor Phase": r"(?i)(Motor Phase)\s*[:;-]\s*(.*)",
        "Head": r"(?i)(Head)\s*[:;-]\s*(.*)",
        "Power Rating": r"(?i)(Power Rating)\s*[:;-]\s*(.*)",
        "Country of Origin": r"(?i)(Country of Origin)\s*[:;-]\s*(.*)",
        "Minimum Order Quantity": r"(?i)(Minimum Order Quantity)\s*[:;-]\s*(.*)"
    }

    for field, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            value = match.group(2).strip()
            if value:  # Only include fields with values
                structured_data[field] = value
    return structured_data

# Main Execution
def main():
    # Path to the image
    image_path = "image.png"  # Replace with the correct path to your image

    # Preprocess the image
    preprocessed_path = preprocess_image(image_path)

    # Initialize EasyOCR Reader
    reader = initialize_reader()
    if not reader:
        return

    # Load the Image
    if not load_image(preprocessed_path):
        return

    # Perform OCR
    extracted_text = perform_ocr(reader, preprocessed_path)
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
