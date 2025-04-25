from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import groq
import requests
import base64
from PIL import Image
import io
from typing import List
import time
from collections import defaultdict
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Groq client
groq_client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(title="CSI GroqBot API")

# Rate limiting configuration
RATE_LIMIT_DURATION = 60  # 1 minute window
MAX_REQUESTS = 30  # Maximum requests per minute
request_history = defaultdict(list)

# CORS configuration
origins = [
    "http://localhost:5174",
    "http://localhost:5175",  # Add this port
    "http://localhost:3000",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",  # Add this port
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File size limits
IMAGE_MAX_SIZE = 20 * 1024 * 1024  # 20MB
AUDIO_MAX_SIZE = 50 * 1024 * 1024  # 50MB
TEXT_MAX_LENGTH = 10000  # characters

async def check_rate_limit(request: Request):
    client_ip = request.client.host
    now = time.time()
    
    # Remove old requests
    request_history[client_ip] = [req_time for req_time in request_history[client_ip] 
                                if now - req_time < RATE_LIMIT_DURATION]
    
    # Check if rate limit is exceeded
    if len(request_history[client_ip]) >= MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )
    
    # Add current request
    request_history[client_ip].append(now)

async def validate_file_size(file: UploadFile, file_type: str):
    if file_type == 'image':
        max_size = IMAGE_MAX_SIZE
        size_mb = IMAGE_MAX_SIZE // (1024 * 1024)
    else:  # audio
        max_size = AUDIO_MAX_SIZE
        size_mb = AUDIO_MAX_SIZE // (1024 * 1024)

    # Read first chunk to check size
    first_chunk = await file.read(max_size + 1)
    await file.seek(0)  # Reset file pointer
    
    if len(first_chunk) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds maximum limit of {size_mb}MB"
        )

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(
        f"Path: {request.url.path} "
        f"Method: {request.method} "
        f"Status: {response.status_code} "
        f"Duration: {duration:.2f}s"
    )
    return response

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.get("/")
async def read_root():
    return {"message": "Welcome to CSI GroqBot API"}

@app.post("/analyze/image")
async def analyze_image(request: Request, file: UploadFile = File(...)):
    await check_rate_limit(request)
    await validate_file_size(file, 'image')
    
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
        logger.error(f"Error processing image: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/audio")
async def analyze_audio(request: Request, file: UploadFile = File(...)):
    await check_rate_limit(request)
    await validate_file_size(file, 'audio')
    
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
        logger.error(f"Error processing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/text")
async def analyze_text(request: Request, text: str = Form(...)):
    await check_rate_limit(request)
    
    if len(text) > TEXT_MAX_LENGTH:
        raise HTTPException(
            status_code=413,
            detail=f"Text length exceeds maximum limit of {TEXT_MAX_LENGTH} characters"
        )
    
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
        logger.error(f"Error processing text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 