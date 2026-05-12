"""Reusable mock interview histories for final feedback validation."""

from __future__ import annotations

STRONG_CANDIDATE_MESSAGES = [
    {
        "role": "assistant",
        "content": "Explain your role in the payment API migration.",
    },
    {
        "role": "user",
        "content": (
            "I owned the migration of three payment endpoints from a monolith to FastAPI. "
            "I designed the request validation layer, added idempotency keys, and cut average "
            "response time from 420ms to 180ms after introducing async DB access and query optimization."
        ),
    },
    {
        "role": "assistant",
        "content": "How did you verify that the migration was safe in production?",
    },
    {
        "role": "user",
        "content": (
            "I added contract tests, replayed masked production traffic in staging, and released with "
            "a 10 percent canary. We monitored error rate and latency for two days before full rollout. "
            "The rollback path was the old monolith route behind a feature flag."
        ),
    },
]


WEAK_CANDIDATE_MESSAGES = [
    {
        "role": "assistant",
        "content": "Tell me what you personally implemented in the recommendation feature.",
    },
    {
        "role": "user",
        "content": (
            "We worked on it together. I mostly helped here and there, and it worked well. "
            "The system got better results after we changed some logic."
        ),
    },
    {
        "role": "assistant",
        "content": "What exact logic changed and what result improved?",
    },
    {
        "role": "user",
        "content": (
            "I do not remember the exact details, but I think we improved the algorithm. "
            "The users seemed happier and the performance was fine."
        ),
    },
]
