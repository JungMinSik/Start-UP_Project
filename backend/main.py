# backend/main.py

from database import engine, Base
import models
from fastapi import FastAPI, Depends,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import Depends
from sqlalchemy.orm import Session
from database import SessionLocal

from ai_logic import (
    generate_first_question,
    generate_followup_question,
    adjust_resume
)

from feedback_service import FinalFeedbackService

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
    job_title: str
    history: list

class ResumeRequest(BaseModel):
    job_title: str
    resume_text: str

    # ── 새로 추가할 요청 모델 ──
class SaveSessionRequest(BaseModel):
    session_id: str
    role: str
    content: str


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
async def feedback(req: FeedbackRequest):
    # 기존 로직 대신 팀원의 FinalFeedbackService 사용
    service = FinalFeedbackService()
    try:
        result = await service.generate(job_title=req.job_title, messages=req.history)
        return {"feedback": result.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/resume/adjust")
def resume_adjust(req: ResumeRequest):
    result = adjust_resume(req.job_title, req.resume_text)
    return result

# ── DB 세션을 열고 닫는 함수 ──
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── 1. 대화 내용 DB 저장 엔드포인트 ──
@app.post("/session/save")
def save_session(req: SaveSessionRequest, db: Session = Depends(get_db)):
    new_message = models.SessionHistory(
        session_id=req.session_id,
        role=req.role,
        content=req.content
    )
    db.add(new_message)
    db.commit()
    return {"message": "데이터베이스 저장 완료"}

# ── 2. 기존 대화 DB 불러오기 엔드포인트 ──
@app.get("/session/load/{session_id}")
def load_session(session_id: str, db: Session = Depends(get_db)):
    # 특정 session_id를 가진 대화 기록을 모두 가져옵니다
    history = db.query(models.SessionHistory).filter(models.SessionHistory.session_id == session_id).all()
    
    # 프론트엔드가 쓰기 편하게 리스트 형태로 변환해서 응답
    return [{"role": msg.role, "content": msg.content} for msg in history]