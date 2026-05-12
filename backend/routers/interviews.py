"""Interview routes for the MVP flow."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Interview, Message
from backend.schemas import InterviewEndResponse
from backend.services.feedback_service import FinalFeedbackService

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


@router.post("/{session_uuid}/end", response_model=InterviewEndResponse)
async def end_interview(
    session_uuid: str,
    db: Session = Depends(get_db),
) -> InterviewEndResponse:
    interview = (
        db.query(Interview)
        .filter(Interview.session_uuid == session_uuid)
        .first()
    )
    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found.",
        )

    history = (
        db.query(Message)
        .filter(Message.interview_id == interview.id)
        .order_by(Message.turn_index.asc())
        .all()
    )
    if not history:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate final feedback without interview history.",
        )

    service = FinalFeedbackService()
    try:
        feedback = await service.generate(
            job_title=interview.job_title,
            messages=history,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to generate final interview feedback.",
        ) from exc

    interview.status = "completed"
    interview.feedback_summary = feedback.summary
    interview.ended_at = datetime.utcnow()
    db.add(interview)
    db.commit()
    db.refresh(interview)

    payload = feedback.model_dump() if hasattr(feedback, "model_dump") else feedback.dict()
    return InterviewEndResponse(
        session_uuid=interview.session_uuid,
        status="completed",
        ended_at=interview.ended_at,
        **payload,
    )
