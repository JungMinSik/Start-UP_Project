# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite 데이터베이스 파일 이름 설정 (VS Code 폴더 안에 생깁니다)
SQLALCHEMY_DATABASE_URL = "sqlite:///./database.db"

# 커넥션 엔진 생성 (SQLite는 동시에 여러 접근이 안 되므로 check_same_thread 옵션 해제)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()