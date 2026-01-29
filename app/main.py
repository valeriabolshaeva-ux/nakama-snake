"""
Точка входа Snake Game API.

Это главный файл backend сервера.
Здесь определены все API эндпоинты (URL адреса) для игры.

Запуск:
    uvicorn app.main:app --reload --port 8000
    
Документация API (после запуска):
    http://localhost:8000/docs
"""

from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db, init_db
from app.models import Score
from app.schemas import (
    BestScoreResponse,
    GameStatsResponse,
    HealthResponse,
    LeaderboardEntry,
    LeaderboardResponse,
    ScoreCreate,
    ScoreResponse,
)


# ==============================================================================
# Создание приложения FastAPI
# ==============================================================================

app = FastAPI(
    title="🐍 Snake Game API",
    description="""
    API для игры Змейка.
    
    ## Возможности:
    - 📊 Сохранение результатов игры
    - 🏆 Таблица лидеров
    - 📈 Статистика игр
    
    ## Как использовать:
    1. Frontend отправляет результат игры на `/api/scores`
    2. Получает таблицу лидеров с `/api/leaderboard`
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# ==============================================================================
# Настройка CORS
# ==============================================================================
# CORS (Cross-Origin Resource Sharing) нужен чтобы frontend
# на порту 5173 мог обращаться к backend на порту 8000

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # На всякий случай
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8201",  # Docker frontend
        "http://localhost:8200",  # Docker backend
        "http://frontend",        # Docker internal
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы (GET, POST, и т.д.)
    allow_headers=["*"],  # Разрешить все заголовки
)


# ==============================================================================
# Инициализация базы данных при старте
# ==============================================================================

@app.on_event("startup")
async def startup_event():
    """
    Выполняется один раз при запуске сервера.
    
    Создаёт таблицы в базе данных, если их ещё нет.
    """
    init_db()
    print("🐍 Snake Game API запущен!")
    print("📖 Документация: http://localhost:8000/docs")


# ==============================================================================
# API Эндпоинты
# ==============================================================================

@app.get("/", tags=["Root"])
async def root():
    """
    Корневой эндпоинт.
    
    Просто показывает что сервер работает.
    """
    return {
        "message": "🐍 Welcome to Snake Game API!",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check(db: Session = Depends(get_db)):
    """
    Проверка работоспособности сервера.
    
    Проверяет:
    - Работает ли сервер
    - Есть ли подключение к базе данных
    
    Returns:
        HealthResponse: Статус сервера и БД.
    """
    try:
        # Пробуем выполнить простой запрос к БД
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception:
        db_status = "error"
    
    return HealthResponse(
        status="healthy",
        database=db_status,
        version="1.0.0",
    )


@app.post("/api/scores", response_model=ScoreResponse, tags=["Scores"])
async def create_score(score_data: ScoreCreate, db: Session = Depends(get_db)):
    """
    Сохранить результат игры.
    
    Вызывается frontend'ом когда игра заканчивается.
    
    Args:
        score_data: Данные о результате игры.
        db: Сессия базы данных.
    
    Returns:
        ScoreResponse: Сохранённый результат с ID.
    
    Example:
        POST /api/scores
        {
            "player_name": "Валерия",
            "score": 150,
            "snake_length": 16,
            "duration_seconds": 45
        }
    """
    # Создаём новую запись в БД
    new_score = Score(
        player_name=score_data.player_name,
        score=score_data.score,
        snake_length=score_data.snake_length,
        duration_seconds=score_data.duration_seconds,
    )
    
    # Добавляем в сессию и сохраняем
    db.add(new_score)
    db.commit()
    db.refresh(new_score)  # Обновляем объект чтобы получить ID
    
    return new_score


@app.get("/api/leaderboard", response_model=LeaderboardResponse, tags=["Leaderboard"])
async def get_leaderboard(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """
    Получить таблицу лидеров.
    
    Возвращает топ игроков, отсортированных по очкам.
    Для каждого игрока показывается только лучший результат.
    
    Args:
        limit: Максимальное количество записей (по умолчанию 10).
        db: Сессия базы данных.
    
    Returns:
        LeaderboardResponse: Таблица лидеров и общее количество игр.
    """
    # Получаем лучший результат для каждого игрока
    # Используем подзапрос для группировки по игрокам
    subquery = (
        db.query(
            Score.player_name,
            func.max(Score.score).label("max_score"),
        )
        .group_by(Score.player_name)
        .subquery()
    )
    
    # Получаем полные записи для лучших результатов
    best_scores = (
        db.query(Score)
        .join(
            subquery,
            (Score.player_name == subquery.c.player_name)
            & (Score.score == subquery.c.max_score),
        )
        .order_by(Score.score.desc())
        .limit(limit)
        .all()
    )
    
    # Формируем ответ с рангами
    entries = [
        LeaderboardEntry(
            rank=idx + 1,
            player_name=score.player_name,
            score=score.score,
            snake_length=score.snake_length,
            created_at=score.created_at,
        )
        for idx, score in enumerate(best_scores)
    ]
    
    # Считаем общее количество игр
    total_games = db.query(func.count(Score.id)).scalar() or 0
    
    return LeaderboardResponse(
        entries=entries,
        total_games=total_games,
    )


@app.get("/api/scores/best", response_model=BestScoreResponse, tags=["Scores"])
async def get_best_score(
    player_name: str = "Player",
    db: Session = Depends(get_db),
):
    """
    Получить лучший результат игрока.
    
    Args:
        player_name: Имя игрока (по умолчанию "Player").
        db: Сессия базы данных.
    
    Returns:
        BestScoreResponse: Лучший результат и статистика игрока.
    """
    # Получаем все результаты игрока
    player_scores = (
        db.query(Score)
        .filter(Score.player_name == player_name)
        .all()
    )
    
    if not player_scores:
        # Если игрок ещё не играл
        return BestScoreResponse(
            player_name=player_name,
            best_score=0,
            total_games=0,
            average_score=0.0,
        )
    
    # Вычисляем статистику
    scores = [s.score for s in player_scores]
    
    return BestScoreResponse(
        player_name=player_name,
        best_score=max(scores),
        total_games=len(scores),
        average_score=round(sum(scores) / len(scores), 1),
    )


@app.get("/api/stats", response_model=GameStatsResponse, tags=["Stats"])
async def get_game_stats(db: Session = Depends(get_db)):
    """
    Получить общую статистику игры.
    
    Returns:
        GameStatsResponse: Общая статистика всех игр.
    """
    # Считаем статистику
    total_games = db.query(func.count(Score.id)).scalar() or 0
    
    if total_games == 0:
        return GameStatsResponse(
            total_games=0,
            total_players=0,
            highest_score=0,
            average_score=0.0,
            longest_snake=1,
        )
    
    total_players = db.query(func.count(func.distinct(Score.player_name))).scalar() or 0
    highest_score = db.query(func.max(Score.score)).scalar() or 0
    average_score = db.query(func.avg(Score.score)).scalar() or 0.0
    longest_snake = db.query(func.max(Score.snake_length)).scalar() or 1
    
    return GameStatsResponse(
        total_games=total_games,
        total_players=total_players,
        highest_score=highest_score,
        average_score=round(float(average_score), 1),
        longest_snake=longest_snake,
    )


@app.get("/api/scores/history", response_model=list[ScoreResponse], tags=["Scores"])
async def get_score_history(
    player_name: str = "Player",
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """
    Получить историю игр игрока.
    
    Args:
        player_name: Имя игрока.
        limit: Максимальное количество записей.
        db: Сессия базы данных.
    
    Returns:
        List[ScoreResponse]: Список последних игр.
    """
    scores = (
        db.query(Score)
        .filter(Score.player_name == player_name)
        .order_by(Score.created_at.desc())
        .limit(limit)
        .all()
    )
    
    return scores


# ==============================================================================
# Запуск через командную строку
# ==============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
