import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def analyze_resume_text(resume_text: str) -> str:
    """
    이력서 텍스트를 간단히 정리/분석하는 함수입니다.
    입력된 이력서 내용이 너무 짧거나 비어 있으면 오류 메시지를 반환합니다.
    """

    if not resume_text or len(resume_text.strip()) < 20:
        return "이력서 내용이 너무 짧습니다. 더 자세한 이력서 텍스트가 필요합니다."

    return resume_text.strip()


def generate_initial_question(resume_text: str, job_role: str = "개발자") -> str:
    """
    업로드된 이력서 텍스트를 분석하여
    지원 직무에 맞는 첫 번째 면접 질문을 생성하는 함수입니다.
    """

    cleaned_resume = analyze_resume_text(resume_text)

    if cleaned_resume.startswith("이력서 내용이 너무 짧습니다"):
        return cleaned_resume

    prompt = f"""
너는 한국 IT 회사의 면접관입니다.

지원 직무:
{job_role}

아래 이력서 내용을 분석하고, 지원자에게 할 첫 번째 면접 질문 1개를 생성하세요.

이력서 내용:
{cleaned_resume}

조건:
1. 질문은 반드시 1개만 작성하세요.
2. 자기소개처럼 너무 일반적인 질문은 하지 마세요.
3. 이력서에 적힌 경험, 기술, 프로젝트 중 하나를 근거로 질문하세요.
4. 이후 꼬리물기 질문으로 이어질 수 있도록 구체적으로 질문하세요.
5. 한국어 존댓말로 작성하세요.
6. 질문만 출력하세요.
"""

    response = client.responses.create(
        model="gpt-5.2",
        instructions="너는 지원자의 이력서를 꼼꼼히 분석하고 날카로운 첫 면접 질문을 만드는 면접관입니다.",
        input=prompt,
    )

    return response.output_text.strip()