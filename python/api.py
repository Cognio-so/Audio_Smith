from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from llm import generate_response, generate_related_questions
import json
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Verify required API keys are present
if not os.getenv('GOOGLE_API_KEY') or not os.getenv('OPENAI_API_KEY') or not os.getenv('ANTHROPIC_API_KEY'):
    raise ValueError("One or more API keys are missing in environment variables!")

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat_endpoint(request: Request):
    try:
        body = await request.json() 
        message = body.get('message', '').strip()
        model = body.get('model', 'gemini-pro').strip()
        system_prompt = body.get('systemPrompt', 'You are a conversational assistant.').strip()

        if not message:
            raise HTTPException(status_code=400, detail="No message provided")

        # Prepare messages for the model
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]

        # Generate response
        response = ""
        async for chunk in generate_response(messages, model):
            response += chunk

        return JSONResponse({
            "success": True,
            "response": response
        })

    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice-chat")
async def voice_chat_endpoint(request: Request):
    try:
        body = await request.json()
        message = body.get('message', '').strip()
        model = body.get('model', 'gemini-pro').strip()
        system_prompt = body.get('systemPrompt', 'You are a conversational assistant. Keep responses brief and natural.').strip()

        if not message:
            raise HTTPException(status_code=400, detail="No message provided")

        # Prepare messages for the model
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]

        # Generate response
        response = ""
        async for chunk in generate_response(messages, model):
            response += chunk

        return JSONResponse({
            "success": True,
            "response": response
        })

    except Exception as e:
        logger.error(f"Voice chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/related-questions")
async def related_questions_endpoint(request: Request):
    try:
        body = await request.json()
        message = body.get('message', '').strip()
        model = body.get('model', 'gemini-pro').strip()

        if not message:
            raise HTTPException(status_code=400, detail="No message provided")

        # Generate related questions
        questions = await generate_related_questions(message, model)

        return JSONResponse({
            "success": True,
            "questions": questions
        })

    except Exception as e:
        logger.error(f"Related questions error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)