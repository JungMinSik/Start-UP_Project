# backend/main.py

from database import engine, Base
import models
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_logic import (
    generate_first_question,
    generate_followup_question,
    generate_feedback,
    adjust_resume
)

app = FastAPI()
Base.metadata.create_all(bind=engine)

# Next.js(3000포트)에서 오는 요청 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 요청 모델 정의 ──
class StartRequest(BaseModel):
    job_title: str
    resume_text: str

class ChatRequest(BaseModel):
    job_title: str
    resume_text: str
    history: list  # [{"role": "...", "content": "..."}]

class FeedbackRequest(BaseModel):
    history: list

class ResumeRequest(BaseModel):
    job_title: str
    resume_text: str


# ── 엔드포인트 ──

@app.post("/interview/start")
def start_interview(req: StartRequest):
    question = generate_first_question(req.job_title, req.resume_text)
    return {"question": question}

@app.post("/interview/chat")
def chat(req: ChatRequest):
    answer = generate_followup_question(
        req.job_title, req.resume_text, req.history
    )
    return {"answer": answer}

@app.post("/interview/feedback")
def feedback(req: FeedbackRequest):
    result = generate_feedback(req.history)
    return {"feedback": result}

@app.post("/resume/adjust")
def resume_adjust(req: ResumeRequest):
    result = adjust_resume(req.job_title, req.resume_text)
    return result