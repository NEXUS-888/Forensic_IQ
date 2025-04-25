<<<<<<< HEAD
# Forensic IQ 🔍
=======
# Foresic IQ
>>>>>>> 734cb968d3cb9bb97280779edf6988ac873b1b78

Advanced AI-Powered Crime Scene Analysis Tool

## Overview

Forensic IQ is a sophisticated web application that leverages AI to analyze crime scene evidence through multiple modalities:
- 🖼️ Image Analysis
- 🎤 Audio Analysis
- 📝 Text Analysis

## Features

### 1. Image Analysis
- Object detection in crime scene photos
- Evidence identification
- Environmental condition assessment
- Safety concern identification
- Detailed forensic insights

### 2. Audio Analysis
- Speech-to-text transcription
- Emotional tone analysis
- Threat detection
- Key points extraction
- Context analysis

### 3. Text Analysis
- Key findings extraction
- Red flag identification
- Priority assessment
- Action recommendations
- Contextual analysis

## Tech Stack

- **Frontend**: React + TailwindCSS
- **Backend**: FastAPI (Python)
- **AI Integration**: Groq API
- **Image Processing**: Hugging Face Vision Models
- **Audio Processing**: Whisper Model

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Python (3.8 or higher)
- pip (Python package manager)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: .\env\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your API keys:
   ```
   GROQ_API_KEY=your_groq_api_key
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Access the application at `http://localhost:5174`

2. Image Analysis:
   - Click "Image Analysis"
   - Upload a crime scene photo
   - View detailed AI analysis results

3. Audio Analysis:
   - Click "Audio Analysis"
   - Upload an audio recording
   - Review transcription and analysis

4. Text Analysis:
   - Click "Text Analysis"
   - Enter or paste text
   - Click "Analyze Text"
   - Review comprehensive analysis

## API Endpoints

- `POST /analyze/image`: Image analysis endpoint
- `POST /analyze/audio`: Audio analysis endpoint
- `POST /analyze/text`: Text analysis endpoint

## Security Notes

- API keys should be kept secure and never committed to version control
- Use environment variables for sensitive information
- Follow security best practices for production deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

<<<<<<< HEAD
This project is licensed under the MIT License - see the LICENSE file for details. 
=======
MIT License 
>>>>>>> 734cb968d3cb9bb97280779edf6988ac873b1b78
