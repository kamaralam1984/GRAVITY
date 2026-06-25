"""Universal AI failover provider for KVL Track backend.

Priority order (fastest/cheapest first):
  1. Groq        — llama-3.3-70b-versatile   (ultra-fast, generous free tier)
  2. Mistral     — mistral-large-latest        (fast, EU/GDPR)
  3. DeepSeek    — deepseek-chat               (GPT-4 level, very cheap)
  4. Together AI — Llama 3.1 70B              (open-source, reliable)
  5. OpenRouter  — llama-3.1-70b (free)       (universal multi-model gateway)

All providers use the OpenAI-compatible chat/completions format so a single
async helper handles them all. If a provider's key is missing or the call
fails, the next provider in the chain is tried automatically.
"""
import os
import httpx
from typing import List, Dict, Optional
from fastapi import HTTPException

_PROVIDERS = [
    {
        "name": "groq",
        "env": "GROQ_API_KEY",
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "model": "llama-3.3-70b-versatile",
    },
    {
        "name": "mistral",
        "env": "MISTRAL_API_KEY",
        "url": "https://api.mistral.ai/v1/chat/completions",
        "model": "mistral-large-latest",
    },
    {
        "name": "deepseek",
        "env": "DEEPSEEK_API_KEY",
        "url": "https://api.deepseek.com/v1/chat/completions",
        "model": "deepseek-chat",
    },
    {
        "name": "together",
        "env": "TOGETHER_API_KEY",
        "url": "https://api.together.xyz/v1/chat/completions",
        "model": "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    },
    {
        "name": "openrouter",
        "env": "OPENROUTER_API_KEY",
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "model": "meta-llama/llama-3.1-70b-instruct:free",
        "extra_headers": {
            "HTTP-Referer": "https://kvlbusinesssolutions.com",
            "X-Title": "KVL Track",
        },
    },
]


async def _call_provider(p: dict, messages: List[Dict], max_tokens: int) -> str:
    api_key = os.getenv(p["env"], "")
    if not api_key:
        raise ValueError(f"No API key for {p['name']}")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        **(p.get("extra_headers") or {}),
    }
    async with httpx.AsyncClient(timeout=25.0) as client:
        r = await client.post(
            p["url"],
            json={"model": p["model"], "messages": messages, "max_tokens": max_tokens},
            headers=headers,
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()


async def call_ai(
    messages: List[Dict],
    system: str = "",
    max_tokens: int = 600,
) -> Optional[str]:
    """Try all providers in priority order. Returns None if every provider fails."""
    full_messages = (
        [{"role": "system", "content": system}] if system else []
    ) + list(messages)

    for p in _PROVIDERS:
        try:
            return await _call_provider(p, full_messages, max_tokens)
        except Exception:
            continue

    return None


async def call_ai_required(
    messages: List[Dict],
    system: str = "",
    max_tokens: int = 600,
) -> str:
    """Like call_ai but raises HTTP 503 when all providers fail."""
    result = await call_ai(messages, system, max_tokens)
    if result is None:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable — all providers failed. Check API keys.",
        )
    return result


def provider_status() -> List[Dict]:
    """Return configuration status for each provider (no keys exposed)."""
    return [
        {
            "name": p["name"],
            "model": p["model"],
            "configured": bool(os.getenv(p["env"], "")),
        }
        for p in _PROVIDERS
    ]
