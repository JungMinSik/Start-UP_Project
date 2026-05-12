"""Service layer for final interview feedback generation."""

from __future__ import annotations

import json
from typing import Any, Iterable

from backend.prompts.feedback_prompt import (
    FINAL_FEEDBACK_SYSTEM_PROMPT,
    build_feedback_user_prompt,
)
from backend.schemas import FinalFeedbackPayload, InterviewMessageItem


def _model_validate(model_cls: type[FinalFeedbackPayload], payload: dict[str, Any]) -> FinalFeedbackPayload:
    if hasattr(model_cls, "model_validate"):
        return model_cls.model_validate(payload)
    return model_cls.parse_obj(payload)


def serialize_transcript(messages: Iterable[Any]) -> str:
    """Serialize chat history into a stable prompt transcript."""
    lines: list[str] = []

    for index, message in enumerate(messages, start=1):
        if isinstance(message, dict):
            role = str(message.get("role", "unknown")).upper()
            content = str(message.get("content", "")).strip()
        else:
            role = str(getattr(message, "role", "unknown")).upper()
            content = str(getattr(message, "content", "")).strip()

        if not content:
            continue

        lines.append(f"{index}. {role}: {content}")

    return "\n".join(lines)


def _extract_json_text(raw_text: str) -> str:
    text = raw_text.strip()

    if text.startswith("```"):
        lines = text.splitlines()
        if lines:
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("Model response does not contain a JSON object.")

    return text[start : end + 1]


def _normalize_string_list(value: Any) -> list[str]:
    if value is None:
        return []

    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]

    if isinstance(value, str):
        stripped = value.strip()
        return [stripped] if stripped else []

    return [str(value).strip()]


def parse_feedback_payload(raw_text: str) -> FinalFeedbackPayload:
    """Parse and validate the model JSON output."""
    payload = json.loads(_extract_json_text(raw_text))
    normalized = {
        "overall_score": int(payload.get("overall_score", 0)),
        "strengths": _normalize_string_list(payload.get("strengths")),
        "weaknesses": _normalize_string_list(payload.get("weaknesses")),
        "improvements": _normalize_string_list(payload.get("improvements")),
        "summary": str(payload.get("summary", "")).strip(),
    }
    return _model_validate(FinalFeedbackPayload, normalized)


def _extract_completion_text(response: Any) -> str:
    choices = getattr(response, "choices", None)
    if not choices:
        raise ValueError("OpenAI response does not contain choices.")

    first_choice = choices[0]
    message = getattr(first_choice, "message", None)
    content = getattr(message, "content", None)

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        text_parts: list[str] = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                text_parts.append(str(item.get("text", "")))
            elif hasattr(item, "text"):
                text_parts.append(str(item.text))
        joined = "".join(text_parts).strip()
        if joined:
            return joined

    raise ValueError("OpenAI response does not contain text content.")


class FinalFeedbackService:
    """Generate the final interview report from a completed transcript."""

    def __init__(self, client: Any | None = None, model: str = "gpt-4o") -> None:
        self._client = client
        self._model = model

    async def generate(
        self,
        *,
        job_title: str,
        messages: Iterable[InterviewMessageItem | Any],
    ) -> FinalFeedbackPayload:
        transcript = serialize_transcript(messages)
        if not transcript:
            raise ValueError("Cannot generate feedback without interview messages.")

        client = self._client
        if client is None:
            from openai import AsyncOpenAI

            client = AsyncOpenAI()

        response = await client.chat.completions.create(
            model=self._model,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": FINAL_FEEDBACK_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": build_feedback_user_prompt(job_title, transcript),
                },
            ],
        )
        raw_text = _extract_completion_text(response)
        return parse_feedback_payload(raw_text)
