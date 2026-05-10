from initial_question import generate_initial_question

resume_text = """
저는 Python과 FastAPI를 사용하여 웹 서비스를 개발한 경험이 있습니다.
팀 프로젝트에서 백엔드 API 설계와 SQLite 데이터베이스 연동을 담당했습니다.
또한 OpenAI API를 활용한 AI 면접 서비스 개발 프로젝트를 진행했습니다.
"""

job_role = "백엔드 개발자"

question = generate_initial_question(resume_text, job_role)

print("생성된 초기 질문:")
print(question)