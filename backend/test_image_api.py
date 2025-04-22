import requests
import json
import os
from PIL import Image
import io

def test_image_analysis():
    url = "http://localhost:8000/analyze/image"
    
    # Test image file path
    image_path = "test_image.jpeg"
    
    if not os.path.exists(image_path):
        print(f"\nError: Test image not found at {image_path}")
        print("Please add a test image named 'test_image.jpeg' to the backend directory")
        return
    
    try:
        print("Sending request to:", url)
        
        # Open and prepare the image
        with open(image_path, 'rb') as image_file:
            files = {
                'file': ('test_image.jpeg', image_file, 'image/jpeg')
            }
            
            print("\nUploading image...")
            response = requests.post(url, files=files)
            
            print("\nStatus Code:", response.status_code)
            
            if response.status_code == 200:
                print("\nResponse:")
                print(json.dumps(response.json(), indent=2))
            else:
                print("\nError Response:")
                print(response.text)
                
    except requests.exceptions.ConnectionError as e:
        print("\nConnection Error:", str(e))
        print("Make sure the FastAPI server is running on http://localhost:8000")
    except Exception as e:
        print("\nUnexpected Error:", str(e))

if __name__ == "__main__":
    print("Starting Image Analysis API test...")
    test_image_analysis() 