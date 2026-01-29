"""
Pydantic схемы для валидации данных.

Схема = описание структуры данных для API.
- Что принимаем от клиента (frontend)
- Что отдаём клиенту

Pydantic автоматически:
- Проверяет типы данных
- Конвертирует данные (строку "123" в число 123)
- Возвращает понятные ошибки если данные неверные
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ==============================================================================
# Схемы для Score (результаты игры)
# ==============================================================================

class ScoreCreate(BaseModel):
    """
    Схема для создания нового результата.
    
    Это то, что frontend отправляет на backend после игры.
    
    Attributes:
        player_name: Имя игрока (опционально, по умолчанию "Player").
        score: Набранные очки (обязательно, минимум 0).
        snake_length: Длина змейки (обязательно, минимум 1).
        duration_seconds: Время игры в секундах (обязательно, минимум 0).
    
    Example:
        {
            "player_name": "Валерия",
            "score": 150,
            "snake_length": 16,
            "duration_seconds": 45
        }
    """
    
    player_name: str = Field(
        default="Player",
        min_length=1,
        max_length=50,
        description="Имя игрока"
    )
    score: int = Field(
        ...,  # ... означает "обязательное поле"
        ge=0,  # ge = greater or equal (больше или равно)
        description="Набранные очки"
    )
    snake_length: int = Field(
        ...,
        ge=1,
        description="Длина змейки в конце игры"
    )
    duration_seconds: int = Field(
        ...,
        ge=0,
        description="Продолжительность игры в секундах"
    )


class ScoreResponse(BaseModel):
    """
    Схема для ответа с результатом игры.
    
    Это то, что backend отдаёт frontend.
    Включает все поля из ScoreCreate + id и created_at.
    
    Attributes:
        id: Уникальный идентификатор записи.
        player_name: Имя игрока.
        score: Набранные очки.
        snake_length: Длина змейки.
        duration_seconds: Время игры в секундах.
        created_at: Дата и время игры.
    """
    
    id: int
    player_name: str
    score: int
    snake_length: int
    duration_seconds: int
    created_at: datetime
    
    class Config:
        """Настройки схемы."""
        # from_attributes = True позволяет создавать схему из SQLAlchemy модели
        from_attributes = True


class LeaderboardEntry(BaseModel):
    """
    Одна запись в таблице лидеров.
    
    Attributes:
        rank: Место в рейтинге (1, 2, 3, ...).
        player_name: Имя игрока.
        score: Лучший результат.
        snake_length: Максимальная длина змейки.
        created_at: Дата лучшего результата.
    """
    
    rank: int = Field(..., ge=1, description="Место в рейтинге")
    player_name: str
    score: int
    snake_length: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class LeaderboardResponse(BaseModel):
    """
    Ответ с таблицей лидеров.
    
    Attributes:
        entries: Список записей таблицы лидеров.
        total_games: Общее количество сыгранных игр.
    """
    
    entries: List[LeaderboardEntry]
    total_games: int = Field(..., ge=0, description="Всего игр сыграно")


class BestScoreResponse(BaseModel):
    """
    Лучший результат игрока.
    
    Attributes:
        player_name: Имя игрока.
        best_score: Лучший результат.
        total_games: Сколько игр сыграно.
        average_score: Средний результат.
    """
    
    player_name: str
    best_score: int
    total_games: int
    average_score: float = Field(..., ge=0, description="Средний результат")


class HealthResponse(BaseModel):
    """
    Ответ health check эндпоинта.
    
    Attributes:
        status: Статус сервиса ("healthy").
        database: Статус базы данных ("connected" или "error").
        version: Версия приложения.
    """
    
    status: str = "healthy"
    database: str = "connected"
    version: str = "1.0.0"


class GameStatsResponse(BaseModel):
    """
    Общая статистика игры.
    
    Attributes:
        total_games: Всего игр сыграно.
        total_players: Уникальных игроков.
        highest_score: Рекорд всех времён.
        average_score: Средний результат.
    """
    
    total_games: int
    total_players: int
    highest_score: int
    average_score: float
    longest_snake: int
