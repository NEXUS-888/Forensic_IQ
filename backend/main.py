from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import groq
import requests
import base64
from PIL import Image
import io

# Load environment variables
load_dotenv()

# Initialize Groq client
groq_client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(title="CSI GroqBot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to CSI GroqBot API"}

@app.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # Read the image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if needed
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Save to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()

        # API URL for Hugging Face's BLIP model (image captioning)
        API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base"
        
        # Make request to Hugging Face API
        response = requests.post(
            API_URL,
            headers={"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}"},
            data=img_byte_arr
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Hugging Face API error: {response.text}"
            )

        # Get the initial caption
        try:
            caption_data = response.json()
            if isinstance(caption_data, list) and len(caption_data) > 0:
                caption = caption_data[0]['generated_text']
            else:
                raise ValueError(f"Unexpected response format: {caption_data}")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error parsing caption response: {str(e)}, Response: {response.text}"
            )
        
        # Now use Groq to analyze the caption
        analysis_prompt = f"""You are a forensic image analyst. Analyze this crime scene description:
        
        Image Description: {caption}
        
        Provide:
        1. List of objects detected
        2. Potential evidence items
        3. Any signs of violence or criminal activity
        4. Environmental conditions
        5. Safety concerns
        
        Be specific and detailed in your analysis."""
        
        analysis = groq_client.chat.completions.create(
            messages=[
                {"role": "user", "content": analysis_prompt}
            ],
            model="llama3-70b-8192",
            temperature=0.1,
            max_tokens=1000
        )
        
        return {
            "caption": caption,
            "analysis": analysis.choices[0].message.content,
            "success": True
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/audio")
async def analyze_audio(file: UploadFile = File(...)):
    try:
        # Save the uploaded file temporarily
        temp_path = "temp_audio" + os.path.splitext(file.filename)[1]
        with open(temp_path, "wb") as temp_file:
            temp_file.write(await file.read())
        
        try:
            # Open the file and transcribe using Whisper
            with open(temp_path, "rb") as audio_file:
                transcription = groq_client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-large-v3"
                )
            
            # Then analyze the transcription using Mixtral
            analysis_prompt = f"""Analyze this audio transcription from a potential crime scene:
            Transcription: {transcription.text}
            
            Provide:
            1. Key points discussed
            2. Emotional tone analysis
            3. Any potential threats or concerning statements
            4. Relevant context clues
            5. Recommendations for law enforcement
            
            Be specific and detailed in your analysis."""
            
            analysis = groq_client.chat.completions.create(
                messages=[
                    {"role": "user", "content": analysis_prompt}
                ],
                model="llama3-70b-8192",
                temperature=0.1,
                max_tokens=1000
            )
            
            return {
                "transcript": transcription.text,
                "analysis": analysis.choices[0].message.content,
                "success": True
            }
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/text")
async def analyze_text(text: str = Form(...)):
    try:
        prompt = f"""You are a forensic text analyst. Analyze this text from a potential crime scene or investigation:
        
        Text: {text}
        
        Provide:
        1. Key findings and observations
        2. Potential red flags or warnings
        3. Contextual analysis
        4. Recommended actions
        5. Priority level (Low/Medium/High)
        
        Be thorough and specific in your analysis."""
        
        analysis = groq_client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="llama3-70b-8192",
            temperature=0.1,
            max_tokens=1000
        )
        
        return {
            "analysis": analysis.choices[0].message.content,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 