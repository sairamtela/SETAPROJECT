import cv2
import easyocr
from simple_salesforce import Salesforce

# Salesforce credentials
SF_USERNAME = 'sairamtelagamsetti@sathkrutha.sandbox'
SF_PASSWORD = 'Sairam12345@'
SF_SECURITY_TOKEN = 'FTvAU65IiITF4541K2Y5tDgi'
SF_DOMAIN = 'login'

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
        temp_image_path = "captured_frame.jpg"
        cv2.imwrite(temp_image_path, frame)

        # Perform OCR
        results = reader.readtext(temp_image_path)
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
        
        # Split extracted text into structured data (example: parsing logic can be added here)
        structured_data = {
            'Name': extracted_text[:80],  # Truncate to 80 characters for the Name field
            'Description__c': extracted_text  # Example additional field for detailed text
        }

        # Replace 'Your_Salesforce_Object__c' with the actual Salesforce object API name
        print(f"Structured Data to Save: {structured_data}")
        result = sf.Your_Salesforce_Object__c.create(structured_data)
        
        # Debug: Log the Salesforce response
        print(f"Record created successfully in Salesforce with ID: {result['id']}")
    except Exception as e:
        # Debug: Log the error response from Salesforce
        print(f"Error saving data to Salesforce: {e}")

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

        # Release camera resources
        cap.release()
        cv2.destroyAllWindows()
    else:
        print("Failed to capture frame. Exiting...")

if __name__ == "__main__":
    main()
