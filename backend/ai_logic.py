# backend/ai_logic.py

from openai import OpenAI
from prompts import (
    INTERVIEWER_PROMPT,
    FIRST_QUESTION_PROMPT,
    FEEDBACK_PROMPT,
    RESUME_PROMPT
)
import json
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # .env의 OPENAI_API_KEY 자동으로 읽어옴


# ── 1. 첫 질문 생성 ──
def generate_first_question(job_title: str, resume_text: str) -> str:
    prompt = FIRST_QUESTION_PROMPT.format(
        job_title=job_title,
        resume_text=resume_text[:2000]  # 토큰 절약
    )
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300
    )
    return response.choices[0].message.content.strip()


# ── 2. 꼬리물기 질문 생성 (대화 히스토리 전체 포함) ──
def generate_followup_question(
    job_title: str,
    resume_text: str,
    history: list  # [{"role": "user"/"assistant", "content": "..."}]
) -> str:

    system_prompt = INTERVIEWER_PROMPT.format(
        job_title=job_title,
        resume_summary=resume_text[:800]
    )

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)  # 대화 전체 그대로 추가

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=400
    )
    return response.choices[0].message.content.strip()


# ── 3. 면접 종료 후 피드백 생성 ──
def generate_feedback(history: list) -> str:
    messages = [
        {"role": "system", "content": FEEDBACK_PROMPT},
        *history,
        {"role": "user", "content": "지금까지의 면접을 종합 평가해줘."}
    ]
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=1000
    )
    return response.choices[0].message.content.strip()


# ── 4. 이력서 첨삭 ──
def adjust_resume(job_title: str, resume_text: str) -> dict:
    prompt = RESUME_PROMPT.format(
        job_title=job_title,
        resume_text=resume_text
    )
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2000
    )
    raw = response.choices[0].message.content.strip()

    # JSON 파싱
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # 혹시 ```json ... ``` 형태로 올 경우 대비
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)