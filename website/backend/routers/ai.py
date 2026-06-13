from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import anthropic, os

router = APIRouter()

def get_client():
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")
    return anthropic.Anthropic(api_key=api_key)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class RoutineRequest(BaseModel):
    user_id: str
    user_name: str
    hours_inactive: float
    last_location: str
    usual_pattern: str


SYSTEM_PROMPT = """You are a warm, empathetic family safety assistant for Trackalways Gravity.
Help families stay connected and safe. Respond in a caring, human tone — not robotic.
Keep responses concise (under 3 sentences unless detail is needed)."""


@router.post("/chat")
async def chat(req: ChatRequest):
    try:
        client = get_client()
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            system=SYSTEM_PROMPT,
            messages=[{"role": m.role, "content": m.content} for m in req.messages[-10:]],
        )
        return {"content": response.content[0].text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-routine")
async def analyze_routine(req: RoutineRequest):
    """AI-powered routine anomaly detection — returns caring alert message."""
    try:
        client = get_client()
        prompt = (
            f"Family safety check: {req.user_name} has been inactive for {req.hours_inactive:.1f} hours at {req.last_location}. "
            f"Their usual pattern is: {req.usual_pattern}. "
            f"Generate a single warm, caring alert message (under 20 words) that a family member would receive. "
            f"Frame it as a gentle check-in, not an alarm."
        )
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=80,
            messages=[{"role": "user", "content": prompt}],
        )
        alert_text = response.content[0].text.strip('"').strip("'")
        severity = "high" if req.hours_inactive > 6 else "medium" if req.hours_inactive > 3 else "low"
        return {"alert": alert_text, "severity": severity, "hours_inactive": req.hours_inactive}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/safety-tips")
async def safety_tips():
    return {
        "tips": [
            {"tip": "Set up geofences around school and home for automatic arrival alerts", "category": "geofencing"},
            {"tip": "Enable Privacy Hours during work calls so family knows you're busy", "category": "privacy"},
            {"tip": "Add elderly family members to the Care plan for fall detection", "category": "elderly"},
            {"tip": "Test your SOS button monthly so it works when you need it most", "category": "safety"},
            {"tip": "Share journeys for any route over 30 minutes for peace of mind", "category": "journey"},
            {"tip": "Set low battery alerts at 20% so you never lose track of family", "category": "battery"},
            {"tip": "Use multiple circles — one for immediate family, one for extended family", "category": "circles"},
        ]
    }
