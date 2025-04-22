import requests
import json
import os
import sys

def test_audio_analysis(audio_file_path=None):
    print("Starting Audio Analysis API test...")
    
    # API endpoint
    url = "http://localhost:8000/analyze/audio"
    print(f"Sending request to: {url}\n")
    
    # Use provided file path or default to test_audio.wav
    if not audio_file_path:
        if len(sys.argv) > 1:
            audio_file_path = sys.argv[1]
        else:
            audio_file_path = "test_audio.wav"
    
    print(f"Using audio file: {audio_file_path}")
    
    try:
        # Check if file exists
        if not os.path.exists(audio_file_path):
            print(f"\nError: Audio file not found at {audio_file_path}")
            print("Please provide a valid audio file path")
            return
            
        # Get the MIME type based on file extension
        mime_types = {
            '.wav': 'audio/wav',
            '.mp3': 'audio/mpeg',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.flac': 'audio/flac',
            '.opus': 'audio/opus',
            '.webm': 'audio/webm'
        }
        ext = os.path.splitext(audio_file_path)[1].lower()
        mime_type = mime_types.get(ext, 'audio/mpeg')
        
        # Open and send the audio file
        with open(audio_file_path, "rb") as audio_file:
            print("Uploading audio...")
            files = {"file": (os.path.basename(audio_file_path), audio_file, mime_type)}
            response = requests.post(url, files=files)
        
        # Print status code
        print(f"\nStatus Code: {response.status_code}\n")
        
        # Print response
        print("Response:")
        print(json.dumps(response.json(), indent=2))
            
    except FileNotFoundError:
        print(f"\nError: Audio file not found at {audio_file_path}")
        print("Please provide a valid audio file path")
    except requests.exceptions.ConnectionError:
        print("\nError: Could not connect to the server. Make sure the FastAPI server is running.")
    except Exception as e:
        print(f"\nError: {str(e)}")

if __name__ == "__main__":
    test_audio_analysis() 