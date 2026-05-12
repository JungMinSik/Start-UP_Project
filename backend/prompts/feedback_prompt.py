"""Prompt helpers for final interview feedback generation."""

from __future__ import annotations

FINAL_FEEDBACK_SYSTEM_PROMPT = """
You are a senior technical interviewer writing the final evaluation report
after a completed mock interview.

Your job:
1. Read the full interview history.
2. Evaluate the candidate based only on what appears in the transcript.
3. Focus on technical clarity, ownership, specificity, logic, and evidence.
4. Do not continue the interview.
5. Do not ask new questions.
6. Do not include markdown, prose outside JSON, or code fences.

Return JSON only in this exact shape:
{
  "overall_score": 0,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvements": ["string"],
  "summary": "string"
}

Rules:
- overall_score must be an integer from 0 to 100.
- strengths, weaknesses, improvements must each contain 2 to 5 short items.
- summary must be 2 to 4 sentences.
- Be strict but fair.
- Base the report only on the transcript and job title.
- Treat unsupported claims, vague answers, and weak ownership as negative signals.
- Reward specific technical ownership, measurable outcomes, clear tradeoffs, and honest limitations.
""".strip()


def build_feedback_user_prompt(job_title: str, transcript: str) -> str:
    """Build the user prompt for the final feedback report."""
    return (
        "Generate the final interview feedback report.\n\n"
        "Evaluation rubric:\n"
        "- 90-100: strong ownership, clear implementation detail, concrete metrics, consistent logic\n"
        "- 75-89: generally strong but missing some evidence, metrics, or tradeoff detail\n"
        "- 60-74: mixed quality, partially convincing, several vague or weak answers\n"
        "- 40-59: weak ownership, unclear technical reasoning, many unsupported claims\n"
        "- 0-39: highly unconvincing, contradictory, or mostly non-specific answers\n\n"
        "What to look for:\n"
        "- ownership: did the candidate explain their own contribution clearly?\n"
        "- specificity: are there concrete implementation details instead of general claims?\n"
        "- evidence: are outcomes, metrics, or measurable results provided?\n"
        "- logic: are answers internally consistent and technically believable?\n"
        "- communication: does the candidate answer directly and clearly?\n\n"
        "How to fill the output:\n"
        "- strengths: what the candidate did well in the interview\n"
        "- weaknesses: what was weak, vague, unsupported, or inconsistent\n"
        "- improvements: actionable next steps for improving interview performance\n"
        "- summary: concise hiring-style judgment based only on the transcript\n\n"
        f"Job title:\n{job_title.strip() or 'Unknown'}\n\n"
        "Interview transcript:\n"
        "<<TRANSCRIPT_START>>\n"
        f"{transcript.strip()}\n"
        "<<TRANSCRIPT_END>>\n"
    )
