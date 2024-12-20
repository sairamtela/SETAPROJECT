import easyocr
import cv2

def preprocess_and_ocr(image_path):
    # Preprocess Image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
    _, img = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY)

    # OCR
    reader = easyocr.Reader(['en'])
    results = reader.readtext(img)
    extracted_text = "\n".join([result[1] for result in results])

    print("OCR Output:", extracted_text)
    return extracted_text

# Example Usage
preprocessed_text = preprocess_and_ocr("uploaded_image.png")
print("Preprocessed OCR:", preprocessed_text)
