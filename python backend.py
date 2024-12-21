import cv2
import easyocr
from simple_salesforce import Salesforce
import os

# Salesforce credentials
SF_USERNAME = 'gopichandra@sathkrutha.com'
SF_PASSWORD = 'Gopi@12345'
SF_SECURITY_TOKEN = 'TIfdMTLPm7V7fFuNmzcofcMt'
SF_DOMAIN = 'login'

# Temporary path for saving captured frame
TEMP_IMAGE_PATH = "captured_frame.jpg"

# Initialize Salesforce connection
def initialize_salesforce():
    try:
        sf = Salesforce(
            username=SF_USERNAME, 
            password=SF_PASSWORD, 
            security_token=SF_SECURITY_TOKEN, 
            domain=SF_DOMAIN
        )
        print("Salesforce connection established.")
        return sf
    except Exception as e:
        print(f"Error initializing Salesforce: {e}")
        return None

# Initialize EasyOCR Reader
def initialize_reader():
    try:
        reader = easyocr.Reader(['en'])
        print("OCR reader initialized.")
        return reader
    except Exception as e:
        print(f"Error initializing EasyOCR Reader: {e}")
        return None

# Initialize Camera
def initialize_camera():
    print("Initializing camera...")
    cap = cv2.VideoCapture(0)  # Use the correct index for your camera
    if not cap.isOpened():
        print("Error: Camera not accessible.")
        return None
    print("Camera initialized successfully.")
    return cap

# Capture a frame from the camera
def capture_frame(cap):
    if not cap:
        print("Error: Camera not initialized.")
        return None
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to capture frame.")
        return None
    print("Frame captured successfully.")
    return frame

# Perform OCR on the captured frame
def perform_ocr(reader, frame):
    try:
        # Save frame temporarily for OCR processing
        cv2.imwrite(TEMP_IMAGE_PATH, frame)

        # Perform OCR
        results = reader.readtext(TEMP_IMAGE_PATH)
        extracted_text = "\n".join([result[1] for result in results])
        print("\nExtracted Text:")
        print(extracted_text)
        return extracted_text
    except Exception as e:
        print(f"Error performing OCR: {e}")
        return ""

# Save extracted data to Salesforce
def save_to_salesforce(sf, extracted_text):
    try:
        # Debug: Log the extracted text
        print("Preparing data for Salesforce...")

        # Example parsing logic for structured data (extendable as needed)
        structured_data = {
            'Name': extracted_text[:80],  # Truncate to 80 characters for the Name field
            'Description__c': extracted_text  # Additional field for detailed text
        }

        # Replace 'Your_Salesforce_Object__c' with the actual Salesforce object API name
        print(f"Structured Data to Save: {structured_data}")
        result = sf.SETA_DETAILS__c.create(structured_data)  # Replace with your object name

        # Debug: Log the Salesforce response
        print(f"Record created successfully in Salesforce with ID: {result['id']}")
    except Exception as e:
        # Debug: Log the error response from Salesforce
        print(f"Error saving data to Salesforce: {e}")

# Clean up temporary files
def cleanup():
    if os.path.exists(TEMP_IMAGE_PATH):
        os.remove(TEMP_IMAGE_PATH)
        print("Temporary file cleaned up.")

# Main Execution
def main():
    # Initialize Salesforce
    sf = initialize_salesforce()
    if not sf:
        print("Salesforce initialization failed. Exiting...")
        return

    # Initialize OCR Reader
    reader = initialize_reader()
    if not reader:
        print("OCR reader initialization failed. Exiting...")
        return

    # Initialize Camera
    cap = initialize_camera()
    if not cap:
        print("Camera initialization failed. Exiting...")
        return

    try:
        # Capture a frame
        frame = capture_frame(cap)
        if frame is not None:
            cv2.imshow('Captured Frame', frame)
            cv2.waitKey(0)

            # Perform OCR on the frame
            extracted_text = perform_ocr(reader, frame)

            # Save extracted data to Salesforce
            if extracted_text:
                save_to_salesforce(sf, extracted_text)
            else:
                print("No text extracted from the frame.")

        else:
            print("Failed to capture frame. Exiting...")

    finally:
        # Release camera resources
        if cap:
            cap.release()
        cv2.destroyAllWindows()

        # Clean up temporary files
        cleanup()

if __name__ == "__main__":
    main()
