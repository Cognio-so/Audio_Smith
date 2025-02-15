from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from llm import generate_response, generate_related_questions
import json
import logging
import os
from dotenv import load_dotenv
from uuid import uuid4
import time

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

# Add session management
sessions = {}

async def get_session_id(request: Request):
    session_id = request.headers.get('X-Session-ID')
    if not session_id:
        session_id = str(uuid4())
        sessions[session_id] = {'created_at': time.time()}
    return session_id

@app.post("/chat")
async def chat_endpoint(request: Request, session_id: str = Depends(get_session_id)):
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

        # Generate response with session ID
        response = ""
        async for chunk in generate_response(messages, model, session_id):
            response += chunk

        return JSONResponse({
            "success": True,
            "response": response,
            "sessionId": session_id
        })

    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice-chat")
async def voice_chat_endpoint(request: Request, session_id: str = Depends(get_session_id)):
    try:
        body = await request.json()
        message = body.get('message', '').strip()
        model = body.get('model', 'gemini-pro').strip()
        language = body.get('language', 'en-US').strip()  # This comes from Deepgram's detection

        if not message:
            return JSONResponse({
                "success": False,
                "detail": "No message provided"
            }, status_code=400)

        logger.info(f"Voice chat request: message='{message}', model={model}, language={language}")

        # Enhanced system prompt for multilingual support
        system_prompt = (
            f"You are a helpful assistant. Respond in {language}. "
            f"If the user speaks in Hindi, respond in Hindi. "
            f"If they speak in English, respond in English. "
            f"Maintain the same language and style as the user's input. "
            f"Keep responses natural and conversational in the detected language."
        )

        # Prepare messages for the model
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]

        try:
            response = ""
            async for chunk in generate_response(messages, model, session_id):
                response += chunk

            if not response:
                raise ValueError("No response generated")

            return JSONResponse({
                "success": True,
                "response": response,
                "language": language
            })

        except Exception as e:
            logger.error(f"Model error: {str(e)}")
            return JSONResponse({
                "success": False,
                "detail": f"Model error: {str(e)}"
            }, status_code=500)

    except Exception as e:
        logger.error(f"Voice chat error: {str(e)}")
        return JSONResponse({
            "success": False,
            "detail": str(e)
        }, status_code=500)

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