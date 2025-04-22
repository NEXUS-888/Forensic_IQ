import os
from dotenv import load_dotenv
import groq

# Load environment variables
load_dotenv()

# Initialize Groq client
groq_client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))

try:
    # List available models
    models = groq_client.models.list()
    print("\nAvailable Models:")
    for model in models.data:
        print(f"- {model.id}")
except Exception as e:
    print("Error:", str(e)) 