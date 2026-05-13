from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from typing import Generator
from sqlalchemy.orm import Session

from dotenv import load_dotenv
import os

# .env 로드
load_dotenv()

# 환경변수에서 DB 주소 가져오기
DATABASE_URL = os.getenv("DATABASE_URL")

# PostgreSQL 엔진 생성
engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}
)

# 세션 생성
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 모델 베이스
Base = declarative_base()

# DB 세션 함수
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()