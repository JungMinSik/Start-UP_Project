"""Focused tests for the final feedback service."""

from __future__ import annotations

import unittest

from backend.prompts.feedback_prompt import build_feedback_user_prompt
from backend.services.feedback_service import (
    FinalFeedbackService,
    parse_feedback_payload,
    serialize_transcript,
)
from backend.tests.mock_interview_cases import (
    STRONG_CANDIDATE_MESSAGES,
    WEAK_CANDIDATE_MESSAGES,
)


class _FakeMessage:
    def __init__(self, content: str) -> None:
        self.content = content


class _FakeChoice:
    def __init__(self, content: str) -> None:
        self.message = _FakeMessage(content)


class _FakeResponse:
    def __init__(self, content: str) -> None:
        self.choices = [_FakeChoice(content)]


class _FakeCompletions:
    def __init__(self, content: str) -> None:
        self._content = content

    async def create(self, **_: object) -> _FakeResponse:
        return _FakeResponse(self._content)


class _FakeChat:
    def __init__(self, content: str) -> None:
        self.completions = _FakeCompletions(content)


class _FakeClient:
    def __init__(self, content: str) -> None:
        self.chat = _FakeChat(content)


class FeedbackServiceTests(unittest.IsolatedAsyncioTestCase):
    def test_serialize_transcript(self) -> None:
        transcript = serialize_transcript(
            [
                {"role": "assistant", "content": "Tell me about your project."},
                {"role": "user", "content": "I built the API layer."},
            ]
        )
        self.assertIn("1. ASSISTANT: Tell me about your project.", transcript)
        self.assertIn("2. USER: I built the API layer.", transcript)

    def test_parse_feedback_payload_with_code_fence(self) -> None:
        payload = parse_feedback_payload(
            """```json
            {
              "overall_score": 81,
              "strengths": ["Clear ownership"],
              "weaknesses": ["Few metrics"],
              "improvements": ["Add measurable outcomes"],
              "summary": "Strong practical experience with room for more specificity."
            }
            ```"""
        )
        self.assertEqual(payload.overall_score, 81)
        self.assertEqual(payload.weaknesses, ["Few metrics"])

    def test_build_feedback_user_prompt_contains_rubric_and_markers(self) -> None:
        prompt = build_feedback_user_prompt(
            "Backend Developer",
            serialize_transcript(STRONG_CANDIDATE_MESSAGES),
        )
        self.assertIn("Evaluation rubric:", prompt)
        self.assertIn("<<TRANSCRIPT_START>>", prompt)
        self.assertIn("Backend Developer", prompt)

    def test_mock_cases_have_different_signal_quality(self) -> None:
        strong_transcript = serialize_transcript(STRONG_CANDIDATE_MESSAGES)
        weak_transcript = serialize_transcript(WEAK_CANDIDATE_MESSAGES)

        self.assertIn("420ms to 180ms", strong_transcript)
        self.assertIn("I do not remember the exact details", weak_transcript)

    async def test_generate_feedback_with_fake_client(self) -> None:
        client = _FakeClient(
            """
            {
              "overall_score": 74,
              "strengths": ["Good technical ownership", "Clear architecture explanation"],
              "weaknesses": ["Weak metrics", "Some vague answers"],
              "improvements": ["Use more numbers", "Explain tradeoffs more clearly"],
              "summary": "The candidate shows hands-on experience but needs more specific evidence."
            }
            """
        )
        service = FinalFeedbackService(client=client, model="fake-model")
        result = await service.generate(
            job_title="Backend Developer",
            messages=[
                {"role": "assistant", "content": "Explain your API project."},
                {"role": "user", "content": "I designed and implemented the service layer."},
            ],
        )

        self.assertEqual(result.overall_score, 74)
        self.assertEqual(len(result.strengths), 2)
        self.assertIn("specific evidence", result.summary)
