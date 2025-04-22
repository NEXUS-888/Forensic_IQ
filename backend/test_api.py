import requests

def test_text_analysis():
    url = "http://localhost:8000/analyze/text"
    data = {
        "text": "This is a test message to verify the Groq API integration. Please analyze this text for any potential insights."
    }
    
    try:
        response = requests.post(url, data=data)
        print("Status Code:", response.status_code)
        print("Response:", response.json())
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    test_text_analysis() 