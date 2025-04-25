# Foresic IQ

An AI-powered multimodal crime scene assistant that processes images, audio, and text using Groq's high-speed AI APIs.

## Features

- 🖼️ **Image Analysis**: Upload crime scene photos for AI-powered object detection
- 🎤 **Audio Analysis**: Process audio files for transcription and emotional analysis
- 📝 **Text Analysis**: Analyze written reports for key insights and patterns

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Groq API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv env
   # On Windows:
   .\env\Scripts\activate
   # On Unix/MacOS:
   source env/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your Groq API key:
   ```
   GROQ_API_KEY=your_api_key_here
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

1. Open your browser and navigate to `http://localhost:5173`
2. Upload images, audio files, or enter text for analysis
3. View the AI-generated insights in real-time

## API Endpoints

- `POST /analyze/image`: Analyze crime scene photos
- `POST /analyze/audio`: Process audio recordings
- `POST /analyze/text`: Analyze written reports

## Technologies Used

- Frontend: React + TypeScript + TailwindCSS
- Backend: FastAPI (Python)
- AI: Groq APIs (LLaVA, Whisper, Mixtral)

## Contributing

This project was created during a hackathon. Feel free to submit issues and pull requests for improvements.

## License

MIT License 
