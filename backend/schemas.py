"""Pydantic schemas for the interview feedback flow."""

from __future__ import annotations
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field

InterviewRole = Literal["user", "assistant"]
InterviewStatus = Literal["ongoing", "completed", "aborted"]

class InterviewMessageItem(BaseModel):
    role: InterviewRole
    content: str = Field(..., min_length=1)

class FinalFeedbackPayload(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    summary: str = Field(..., min_length=1)  # (수정) 기본값이 없는 필수값이므로 위로 올림
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)

class InterviewEndResponse(FinalFeedbackPayload):
    session_uuid: str
    ended_at: datetime  # (수정) 기본값이 없는 필수값이므로 status보다 위로 올림
    status: InterviewStatus = "completed"