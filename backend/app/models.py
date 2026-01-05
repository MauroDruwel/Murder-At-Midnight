from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


Speaker = Literal["interviewer", "suspect"]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Utterance(BaseModel):
    speaker: Speaker
    text: str = Field(..., min_length=1)
    timestamp: str = Field(default_factory=now_iso)


class AnalysisResult(BaseModel):
    guilt_score: int = Field(..., ge=1, le=10)
    summary: str = Field(..., min_length=1)
    raw_model_output: Optional[str] = None
    model: Optional[str] = None
    analyzed_at: str = Field(default_factory=now_iso)


class Interview(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    suspect_name: str = Field(..., min_length=1)
    case_context: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)
    utterances: list[Utterance] = Field(default_factory=list)
    last_analysis: Optional[AnalysisResult] = None


class CreateInterviewRequest(BaseModel):
    suspect_name: str = Field(..., min_length=1)
    case_context: Optional[str] = None


class AddUtteranceRequest(BaseModel):
    speaker: Speaker
    text: str = Field(..., min_length=1)


class AnalyzeInterviewRequest(BaseModel):
    # Optional override; interview.case_context will be used if present
    case_context: Optional[str] = None


class InterviewSummary(BaseModel):
    id: str
    suspect_name: str
    created_at: str
    updated_at: str
    utterance_count: int
    last_guilt_score: Optional[int] = None
