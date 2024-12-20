import easyocr
import cv2
import numpy as np

# Initialize EasyOCR Reader
def initialize_reader():
    return easyocr.Reader(['en'], gpu=False)

# Preprocess Image for OCR
def preprocess_image(image_path):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Resize for clarity
    gray = cv2.resize(gray, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)

    # Denoise and apply adaptive thresholding
    denoised = cv2.fastNlMeansDenoising(gray, h=30)
    _, thresh = cv2.threshold(denoised, 128, 255, cv2.THRESH_BINARY)

    # Save for debugging
    preprocessed_path = "preprocessed_image.png"
    cv2.imwrite(preprocessed_path, thresh)
    return preprocessed_path

# Perform OCR and Return Raw Text
def perform_ocr(image_path, reader):
    try:
        results = reader.readtext(image_path)
        # Combine all extracted text into a single string
        extracted_text = "\n".join([result[1] for result in results])
        return extracted_text
    except Exception as e:
        print(f"Error in OCR: {e}")
        return ""

# Extract Structured Data
def extract_structured_data(raw_text):
    structured_data = {}
    patterns = {
        "Model Name/Number": r"(?i)Model Name/Number\s*[:;-]?\s*(.*)",
        "Type": r"(?i)Type\s*[:;-]?\s*(.*)",
        "Motor Phase": r"(?i)Motor Phase\s*[:;-]?\s*(.*)",
        "Head": r"(?i)Head\s*[:;-]?\s*(.*)",
        "Power Rating": r"(?i)Power Rating\s*[:;-]?\s*(.*)",
        "Country of Origin": r"(?i)Country of Origin\s*[:;-]?\s*(.*)",
        "Minimum Order Quantity": r"(?i)Minimum Order Quantity\s*[:;-]?\s*(.*)",
        "Delivery Time": r"(?i)Delivery Time\s*[:;-]?\s*(.*)"
    }
    
    for key, pattern in patterns.items():
        match = re.search(pattern, raw_text)
        if match:
            structured_data[key] = match.group(1).strip()
    return structured_data

# Main Execution
def main(image_path):
    reader = initialize_reader()
    preprocessed_path = preprocess_image(image_path)
    
    raw_text = perform_ocr(preprocessed_path, reader)
    print("\nRaw OCR Output:\n", raw_text)  # Debugging step: Log raw OCR output

    if not raw_text.strip():
        print("No text detected!")
        return

    structured_data = extract_structured_data(raw_text)
    print("\nExtracted Structured Data:")
    for key, value in structured_data.items():
        print(f"{key}: {value}")

# Path to your image
image_path = "image.png"  # Replace with the correct image path
main(image_path)
