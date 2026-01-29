/**
 * API функции для общения с backend.
 * 
 * Все функции делают HTTP запросы к нашему FastAPI серверу.
 * 
 * BASE_URL:
 * - В development: через Vite proxy (/api → http://localhost:8000/api)
 * - В production: напрямую к backend
 */

// Базовый URL для API
// В Vite dev режиме прокси настроен в vite.config.js
const BASE_URL = '/api'

/**
 * Обёртка для fetch с обработкой ошибок.
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  
  return response.json()
}

/**
 * Сохранить результат игры.
 * 
 * @param {Object} scoreData - Данные о результате
 * @param {string} scoreData.player_name - Имя игрока
 * @param {number} scoreData.score - Набранные очки
 * @param {number} scoreData.snake_length - Длина змейки
 * @param {number} scoreData.duration_seconds - Время игры в секундах
 * @returns {Promise<Object>} Сохранённый результат
 * 
 * @example
 * const saved = await saveScore({
 *   player_name: 'Валерия',
 *   score: 150,
 *   snake_length: 16,
 *   duration_seconds: 45,
 * })
 */
export async function saveScore(scoreData) {
  return fetchApi('/scores', {
    method: 'POST',
    body: JSON.stringify(scoreData),
  })
}

/**
 * Получить таблицу лидеров.
 * 
 * @param {number} limit - Количество записей (по умолчанию 10)
 * @returns {Promise<Object>} Таблица лидеров
 * 
 * @example
 * const { entries, total_games } = await getLeaderboard(10)
 * entries.forEach(entry => {
 *   console.log(`${entry.rank}. ${entry.player_name}: ${entry.score}`)
 * })
 */
export async function getLeaderboard(limit = 10) {
  return fetchApi(`/leaderboard?limit=${limit}`)
}

/**
 * Получить лучший результат игрока.
 * 
 * @param {string} playerName - Имя игрока
 * @returns {Promise<Object>} Лучший результат и статистика
 * 
 * @example
 * const { best_score, total_games, average_score } = await getBestScore('Player')
 */
export async function getBestScore(playerName = 'Player') {
  return fetchApi(`/scores/best?player_name=${encodeURIComponent(playerName)}`)
}

/**
 * Получить историю игр игрока.
 * 
 * @param {string} playerName - Имя игрока
 * @param {number} limit - Количество записей
 * @returns {Promise<Array>} Список результатов
 */
export async function getScoreHistory(playerName = 'Player', limit = 20) {
  return fetchApi(`/scores/history?player_name=${encodeURIComponent(playerName)}&limit=${limit}`)
}

/**
 * Получить общую статистику игры.
 * 
 * @returns {Promise<Object>} Статистика всех игр
 * 
 * @example
 * const stats = await getGameStats()
 * console.log(`Всего игр: ${stats.total_games}`)
 * console.log(`Рекорд: ${stats.highest_score}`)
 */
export async function getGameStats() {
  return fetchApi('/stats')
}

/**
 * Проверить здоровье API.
 * 
 * @returns {Promise<Object>} Статус сервера
 */
export async function checkHealth() {
  return fetchApi('/health')
}
