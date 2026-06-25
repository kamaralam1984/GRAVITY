import asyncio
import json
import os

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from routers.ai_provider import call_ai, call_ai_required, provider_status

router = APIRouter()

SYSTEM_PROMPT = """You are a warm, empathetic family safety assistant for KVL Track.
Help families stay connected and safe. Respond in a caring, human tone — not robotic.
Keep responses concise (under 3 sentences unless detail is needed)."""


# ── Request/response models ────────────────────────────────────────────────────

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


class TranscribeRequest(BaseModel):
    audio_url: str
    language: str = "en"


class AnalyzeAudioRequest(BaseModel):
    audio_url: str


class ModerateRequest(BaseModel):
    text: str


# ── Chat endpoint (universal AI failover) ──────────────────────────────────────

@router.post("/chat")
async def chat(req: ChatRequest):
    """Family assistant chat — fails over across Groq → Mistral → DeepSeek → Together → OpenRouter."""
    messages = [{"role": m.role, "content": m.content} for m in req.messages[-10:]]
    content = await call_ai_required(messages, system=SYSTEM_PROMPT, max_tokens=400)
    return {"content": content}


# ── Routine anomaly analysis ───────────────────────────────────────────────────

@router.post("/analyze-routine")
async def analyze_routine(req: RoutineRequest):
    """AI-powered routine anomaly detection — returns a caring alert message."""
    prompt = (
        f"Family safety check: {req.user_name} has been inactive for {req.hours_inactive:.1f} hours "
        f"at {req.last_location}. Their usual pattern is: {req.usual_pattern}. "
        f"Generate a single warm, caring alert message (under 20 words) that a family member would receive. "
        f"Frame it as a gentle check-in, not an alarm."
    )
    alert_text = await call_ai_required(
        [{"role": "user", "content": prompt}],
        max_tokens=80,
    )
    alert_text = alert_text.strip('"').strip("'")
    severity = "high" if req.hours_inactive > 6 else "medium" if req.hours_inactive > 3 else "low"
    return {"alert": alert_text, "severity": severity, "hours_inactive": req.hours_inactive}


# ── Voice transcription (Deepgram Nova-2) ─────────────────────────────────────

@router.post("/transcribe")
async def transcribe_audio(req: TranscribeRequest):
    """Transcribe an audio file URL using Deepgram Nova-2.

    Supports voice SOS messages, family voice notes, and any audio URL
    accessible by Deepgram's servers (public or signed URL).
    """
    api_key = os.getenv("DEEPGRAM_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="Deepgram not configured — set DEEPGRAM_API_KEY")

    params = f"model=nova-2&smart_format=true&language={req.language}&punctuate=true&diarize=true"
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            f"https://api.deepgram.com/v1/listen?{params}",
            headers={
                "Authorization": f"Token {api_key}",
                "Content-Type": "application/json",
            },
            json={"url": req.audio_url},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Deepgram error: {r.text[:300]}")

    try:
        data = r.json()
        alt = data["results"]["channels"][0]["alternatives"][0]
        return {
            "transcript": alt.get("transcript", ""),
            "confidence": round(alt.get("confidence", 0.0), 3),
            "words": alt.get("words", []),
            "paragraphs": alt.get("paragraphs", {}),
            "provider": "deepgram",
        }
    except (KeyError, IndexError):
        raise HTTPException(status_code=502, detail="Unexpected Deepgram response format")


# ── Audio intelligence (AssemblyAI) ───────────────────────────────────────────

@router.post("/analyze-audio")
async def analyze_audio(req: AnalyzeAudioRequest):
    """Full audio analysis via AssemblyAI: transcript + sentiment + content safety.

    Use for SOS voice recordings, suspicious audio review, or family message
    sentiment monitoring. Polling timeout is 90 seconds.
    """
    api_key = os.getenv("ASSEMBLYAI_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="AssemblyAI not configured — set ASSEMBLYAI_API_KEY")

    headers = {"authorization": api_key, "content-type": "application/json"}

    async with httpx.AsyncClient(timeout=90.0) as client:
        # Submit transcription job with all intelligence features
        sub = await client.post(
            "https://api.assemblyai.com/v2/transcript",
            headers=headers,
            json={
                "audio_url": req.audio_url,
                "sentiment_analysis": True,
                "content_safety": True,
                "language_detection": True,
                "auto_highlights": True,
            },
        )
        if sub.status_code != 200:
            raise HTTPException(status_code=502, detail=f"AssemblyAI submit failed: {sub.text[:300]}")

        tid = sub.json()["id"]

        # Poll every 3 s — max 30 iterations = 90 s
        for _ in range(30):
            await asyncio.sleep(3)
            poll = await client.get(
                f"https://api.assemblyai.com/v2/transcript/{tid}",
                headers=headers,
            )
            data = poll.json()
            status = data.get("status")
            if status == "completed":
                return {
                    "transcript": data.get("text", ""),
                    "language": data.get("language_code", "en"),
                    "sentiment_analysis": data.get("sentiment_analysis_results", []),
                    "content_safety": data.get("content_safety_labels", {}),
                    "highlights": data.get("auto_highlights_result", {}),
                    "audio_duration": data.get("audio_duration"),
                    "provider": "assemblyai",
                }
            elif status == "error":
                raise HTTPException(
                    status_code=502,
                    detail=f"AssemblyAI processing error: {data.get('error', 'unknown')}",
                )

    raise HTTPException(status_code=408, detail="AssemblyAI analysis timed out after 90 seconds")


# ── Content moderation (AI-powered) ───────────────────────────────────────────

@router.post("/moderate")
async def moderate_content(req: ModerateRequest):
    """Classify text safety for the family chat using AI moderation.

    Returns safe/unsafe classification with category and confidence.
    Uses the universal failover chain — never crashes the feature.
    """
    if not req.text.strip():
        return {"safe": True, "category": "safe", "confidence": 1.0, "reason": "Empty text"}

    prompt = (
        f'Classify this text for a family safety app used by children and elders.\n'
        f'Text: "{req.text}"\n\n'
        f'Reply with ONLY valid JSON (no markdown):\n'
        f'{{"safe": true_or_false, "category": "safe|offensive|spam|violence|adult|harassment", '
        f'"confidence": 0.0_to_1.0, "reason": "one short sentence"}}'
    )
    result = await call_ai([{"role": "user", "content": prompt}], max_tokens=120)

    if result:
        try:
            start, end = result.find("{"), result.rfind("}") + 1
            if start >= 0 and end > start:
                parsed = json.loads(result[start:end])
                return {**parsed, "provider": "ai"}
        except Exception:
            pass
        # Coarse fallback parse
        is_safe = "\"safe\": true" in result or '"safe":true' in result
        return {
            "safe": is_safe,
            "category": "safe" if is_safe else "flagged",
            "confidence": 0.6,
            "reason": result[:120],
            "provider": "ai",
        }

    # Total AI failure — default allow (fail open so chat still works)
    return {
        "safe": True,
        "category": "safe",
        "confidence": 0.5,
        "reason": "AI moderation unavailable",
        "provider": "none",
    }


# ── Provider status ────────────────────────────────────────────────────────────

@router.get("/providers")
async def get_providers():
    """Show which AI providers are configured (no keys exposed)."""
    statuses = provider_status()
    configured = sum(1 for p in statuses if p["configured"])
    return {
        "providers": statuses,
        "configured_count": configured,
        "failover_active": configured > 1,
    }


# ── Safety tips (static) ───────────────────────────────────────────────────────

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
