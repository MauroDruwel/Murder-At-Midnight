from __future__ import annotations

import os

from fastapi import APIRouter, HTTPException

from .ai import analyze_transcript
from .models import (
    AddUtteranceRequest,
    AnalyzeInterviewRequest,
    AnalysisResult,
    CreateInterviewRequest,
    Interview,
    InterviewSummary,
    Utterance,
)
from .storage import JsonInterviewStore


def build_router(store: JsonInterviewStore) -> APIRouter:
    router = APIRouter()

    @router.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @router.get("/interviews", response_model=list[InterviewSummary])
    def list_interviews() -> list[InterviewSummary]:
        interviews = store.list()
        return [
            InterviewSummary(
                id=i.id,
                suspect_name=i.suspect_name,
                created_at=i.created_at,
                updated_at=i.updated_at,
                utterance_count=len(i.utterances),
                last_guilt_score=(i.last_analysis.guilt_score if i.last_analysis else None),
            )
            for i in interviews
        ]

    @router.post("/interviews", response_model=Interview)
    def create_interview(req: CreateInterviewRequest) -> Interview:
        interview = Interview(suspect_name=req.suspect_name, case_context=req.case_context)
        return store.upsert(interview)

    @router.get("/interviews/{interview_id}", response_model=Interview)
    def get_interview(interview_id: str) -> Interview:
        interview = store.get(interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        return interview

    @router.post("/interviews/{interview_id}/utterances", response_model=Interview)
    def add_utterance(interview_id: str, req: AddUtteranceRequest) -> Interview:
        interview = store.get(interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")

        interview.utterances.append(Utterance(speaker=req.speaker, text=req.text))
        return store.upsert(interview)

    @router.post("/interviews/{interview_id}/analyze", response_model=AnalysisResult)
    def analyze_interview(interview_id: str, req: AnalyzeInterviewRequest) -> AnalysisResult:
        interview = store.get(interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")

        model = os.getenv("OPENROUTER_MODEL", "qwen/qwen3-32b")
        transcript = "\n".join([f"{u.speaker}: {u.text}" for u in interview.utterances])
        if not transcript.strip():
            raise HTTPException(status_code=400, detail="Interview has no utterances")

        case_context = req.case_context or interview.case_context
        try:
            result = analyze_transcript(transcript=transcript, case_context=case_context, model=model)
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Upstream AI error: {e}")

        interview.last_analysis = result
        store.upsert(interview)
        return result

    return router
