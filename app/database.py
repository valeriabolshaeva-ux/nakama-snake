"""
Подключение к SQLite базе данных.

SQLite — это простая база данных, которая хранится в одном файле.
Не нужен отдельный сервер — просто файл snake.db в папке data/.

Использование:
    from app.database import get_db, engine
    
    # В эндпоинтах FastAPI
    @app.get("/api/scores")
    async def get_scores(db: Session = Depends(get_db)):
        return db.query(Score).all()
"""

from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, declarative_base

# ==============================================================================
# Настройки подключения
# ==============================================================================

# Путь к файлу базы данных
# Path(__file__).parent.parent = корень проекта snake/
DATABASE_PATH = Path(__file__).parent.parent / "data" / "snake.db"

# URL подключения к SQLite
# check_same_thread=False нужен для работы с FastAPI (асинхронность)
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# ==============================================================================
# Создание движка и сессии
# ==============================================================================

# Engine — "движок" базы данных, управляет подключениями
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Для SQLite + FastAPI
    echo=False,  # True = показывать SQL запросы в консоли (для отладки)
)

# SessionLocal — фабрика сессий
# Сессия = одно "соединение" с БД для выполнения запросов
SessionLocal = sessionmaker(
    autocommit=False,  # Не коммитить автоматически
    autoflush=False,   # Не сбрасывать изменения автоматически
    bind=engine,       # Привязать к нашему движку
)

# Base — базовый класс для всех моделей (таблиц)
Base = declarative_base()


# ==============================================================================
# Dependency для FastAPI
# ==============================================================================

def get_db() -> Generator[Session, None, None]:
    """
    Получить сессию базы данных.
    
    Это "dependency" для FastAPI — автоматически создаёт сессию
    для каждого запроса и закрывает её после ответа.
    
    Yields:
        Session: Сессия SQLAlchemy для работы с БД.
    
    Example:
        @app.get("/api/scores")
        async def get_scores(db: Session = Depends(get_db)):
            scores = db.query(Score).all()
            return scores
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Инициализировать базу данных.
    
    Создаёт все таблицы, если они ещё не существуют.
    Вызывается один раз при старте приложения.
    """
    # Импортируем модели чтобы SQLAlchemy знал о них
    from app import models  # noqa: F401
    
    # Создаём папку data/ если её нет
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    # Создаём все таблицы
    Base.metadata.create_all(bind=engine)
