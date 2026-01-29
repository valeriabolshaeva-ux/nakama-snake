"""
SQLAlchemy модели (таблицы базы данных).

Модель = описание таблицы в Python коде.
Каждый класс = одна таблица в базе данных.
Каждый атрибут = один столбец в таблице.

Таблицы:
    - Score: результаты игр (очки, дата, имя игрока)
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database import Base


class Score(Base):
    """
    Модель для хранения результатов игры.
    
    Таблица: scores
    
    Attributes:
        id: Уникальный идентификатор записи (автоинкремент).
        player_name: Имя игрока (по умолчанию "Player").
        score: Набранные очки.
        snake_length: Длина змейки в конце игры.
        duration_seconds: Продолжительность игры в секундах.
        created_at: Дата и время игры.
    
    Example:
        >>> new_score = Score(
        ...     player_name="Валерия",
        ...     score=150,
        ...     snake_length=16,
        ...     duration_seconds=45
        ... )
        >>> db.add(new_score)
        >>> db.commit()
    """
    
    __tablename__ = "scores"
    
    # Уникальный ID записи
    # primary_key=True — это первичный ключ (уникальный идентификатор)
    # index=True — создать индекс для быстрого поиска
    id = Column(Integer, primary_key=True, index=True)
    
    # Имя игрока
    # nullable=False — поле обязательное
    # default="Player" — значение по умолчанию
    player_name = Column(String(50), nullable=False, default="Player")
    
    # Набранные очки
    # index=True — индекс для быстрой сортировки по очкам
    score = Column(Integer, nullable=False, default=0, index=True)
    
    # Длина змейки в конце игры
    snake_length = Column(Integer, nullable=False, default=1)
    
    # Продолжительность игры в секундах
    duration_seconds = Column(Integer, nullable=False, default=0)
    
    # Дата и время игры
    # default=datetime.utcnow — автоматически ставить текущее время
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    def __repr__(self) -> str:
        """Строковое представление для отладки."""
        return f"<Score(id={self.id}, player={self.player_name}, score={self.score})>"
