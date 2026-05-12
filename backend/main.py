"""FastAPI app entrypoint."""

from __future__ import annotations

from fastapi import FastAPI

from backend.models import Base
from backend.database import engine
from backend.routers.interviews import router as interviews_router

app = FastAPI(title="AI Interviewer API")
app.include_router(interviews_router)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
