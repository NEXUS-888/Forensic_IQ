import requests
import json

def test_text_analysis():
    url = "http://localhost:8000/analyze/text"
    data = {
        "text": """At approximately 23:15 on March 15th, officers responded to a disturbance call at 742 Pine Street. Upon arrival, they found the front door ajar and signs of forced entry. The living room was in disarray, with furniture overturned and a broken window. A laptop was missing from the desk, and there were muddy footprints leading from the back door to the street. The homeowner, who was away on business, has been notified."""
    }
    
    try:
        print("Sending request to:", url)
        print("\nRequest data:", json.dumps(data, indent=2))
        
        response = requests.post(url, data=data)
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
    print("Starting API test...")
    test_text_analysis() 