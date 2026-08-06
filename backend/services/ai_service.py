from typing import Optional
from fastapi import HTTPException
from groq import Groq
from core.config import settings

def _generate_with_groq(prompt: str, model: Optional[str] = None) -> str:
    if not settings.groq_api_key:
        raise HTTPException(status_code=500, detail="Groq API key is not configured.")
    client = Groq(api_key=settings.groq_api_key)
    completion = client.chat.completions.create(
        model=model or settings.groq_model,
        messages=[
            {"role": "system", "content": "You are a concise assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )
    return (completion.choices[0].message.content or "").strip()


def _generate_text(prompt: str, model: Optional[str] = None) -> str:
    return _generate_with_groq(prompt, model)


def translate_message(content: str, target_language: str, model: Optional[str] = None) -> str:
    prompt = (
        f"Translate the following message to {target_language}. "
        "Return ONLY the translated text, nothing else.\n\n"
        f"Message: {content}"
    )
    return _generate_text(prompt, model=model)


def summarize_conversation(
    messages: list,
    chat_name: str,
    members: list,
    model: Optional[str] = None,
) -> str:
    if not messages:
        return "No messages to summarize."
    formatted = "\n".join(
        f"{m.get('sender_username', 'Unknown')}: {m.get('content', '[media]')}"
        for m in messages
        if not m.get("deleted") and m.get("content")
    )
    prompt = f"""Summarize this chat conversation from the room "{chat_name}".
Members present: {", ".join(members)}

Conversation:
{formatted}

Provide a concise summary covering:
1. Key discussion points
2. Decisions made (if any)
3. Action items or deadlines mentioned (if any)"""
    return _generate_text(prompt, model=model)
