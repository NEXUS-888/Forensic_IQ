# Groq-Powered Analysis Backend

This backend service provides AI-powered analysis capabilities using Groq's models for image, audio, and text processing.

## Features

- Image Analysis: Using Groq's LLaVA model for detailed visual analysis
- Audio Analysis: Combining Groq's Whisper model for transcription and Mixtral model for analysis
- Text Analysis: Leveraging Groq's Mixtral model for comprehensive text analysis

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Add your Groq API key to the `.env` file:
```
GROQ_API_KEY=your_api_key_here
```

## Running the Server

Start the FastAPI server:
```bash
uvicorn main:app --reload
```

The server will be available at `http://localhost:8000`

## API Endpoints

### Image Analysis
- **POST** `/analyze/image`
- Accepts multipart form data with an image file
- Returns structured analysis of the image

### Audio Analysis
- **POST** `/analyze/audio`
- Accepts multipart form data with an audio file
- Returns transcription and analysis

### Text Analysis
- **POST** `/analyze/text`
- Accepts JSON with text content
- Returns comprehensive text analysis

## Security Notes

- Keep your Groq API key secure and never commit it to version control
- The server includes CORS middleware for secure cross-origin requests
- All endpoints validate input data using Pydantic models 