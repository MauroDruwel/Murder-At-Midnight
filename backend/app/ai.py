from __future__ import annotations

import json
import os
import re
from typing import Any, Optional

from .models import AnalysisResult


def _get_openrouter_client():
    try:
        from openrouter import OpenRouter  # type: ignore
    except Exception as e:  # pragma: no cover
        raise RuntimeError(
            "Missing OpenRouter client package. Install deps in backend/ with: pip install -r requirements.txt"
        ) from e

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not set (put it in backend/.env or your shell env).")

    server_url = os.getenv("OPENROUTER_SERVER_URL", "https://ai.hackclub.com/proxy/v1")
    return OpenRouter(api_key=api_key, server_url=server_url)


def _extract_score(text: str) -> Optional[int]:
    match = re.search(r"\b(10|[1-9])\b", text)
    if not match:
        return None
    score = int(match.group(1))
    if 1 <= score <= 10:
        return score
    return None


def analyze_transcript(*, transcript: str, case_context: Optional[str], model: str) -> AnalysisResult:
    system = (
        "You are an AI in a fictional murder-mystery game. "
        "Do NOT claim real-world guilt. You must score how suspicious the suspect sounds in the story. "
        "Return STRICT JSON only with keys: guilt_score (int 1-10), summary (string)."
    )

    user_parts: list[str] = []
    if case_context:
        user_parts.append(f"CASE CONTEXT:\n{case_context}")
    user_parts.append(f"INTERVIEW TRANSCRIPT:\n{transcript}")
    user_parts.append("Respond with JSON only.")
    user = "\n\n".join(user_parts)

    client = _get_openrouter_client()
    response = client.chat.send(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        stream=False,
    )

    content = response.choices[0].message.content

    parsed: dict[str, Any] | None = None
    if isinstance(content, str):
        try:
            parsed = json.loads(content)
        except Exception:
            match = re.search(r"\{[\s\S]*\}", content)
            if match:
                try:
                    parsed = json.loads(match.group(0))
                except Exception:
                    parsed = None

    if parsed and isinstance(parsed, dict):
        score = parsed.get("guilt_score")
        summary = parsed.get("summary")

        score_int: Optional[int]
        if score is None:
            score_int = None
        else:
            try:
                score_int = int(score)
            except Exception:
                score_int = None

        if isinstance(score_int, int) and 1 <= score_int <= 10 and isinstance(summary, str) and summary:
            return AnalysisResult(guilt_score=score_int, summary=summary, raw_model_output=None, model=model)

    # Fallback: extract a number from any output.
    raw = content if isinstance(content, str) else str(content)
    score_fallback = _extract_score(raw) or 5
    return AnalysisResult(
        guilt_score=score_fallback,
        summary="Model did not return valid JSON; used fallback parsing.",
        raw_model_output=raw,
        model=model,
    )
