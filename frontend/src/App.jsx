import { useState, useCallback } from 'react'
import GameBoard from './components/GameBoard'
import StartScreen from './components/StartScreen'
import GameOverScreen from './components/GameOverScreen'
import Leaderboard from './components/Leaderboard'
import Header from './components/Header'
import './styles/App.css'

/**
 * Главный компонент приложения Snake Game.
 * 
 * Управляет состоянием игры:
 * - start: Начальный экран
 * - playing: Игра идёт
 * - gameover: Игра окончена
 * - leaderboard: Таблица лидеров
 */
function App() {
  // Текущее состояние игры
  const [gameState, setGameState] = useState('start')
  
  // Данные последней игры (для экрана Game Over)
  const [lastGameData, setLastGameData] = useState(null)
  
  // Имя игрока
  const [playerName, setPlayerName] = useState('Player')

  /**
   * Начать новую игру
   */
  const handleStartGame = useCallback((name) => {
    setPlayerName(name || 'Player')
    setGameState('playing')
    setLastGameData(null)
  }, [])

  /**
   * Игра окончена
   */
  const handleGameOver = useCallback((gameData) => {
    setLastGameData(gameData)
    setGameState('gameover')
  }, [])

  /**
   * Показать таблицу лидеров
   */
  const handleShowLeaderboard = useCallback(() => {
    setGameState('leaderboard')
  }, [])

  /**
   * Вернуться на главный экран
   */
  const handleBackToStart = useCallback(() => {
    setGameState('start')
    setLastGameData(null)
  }, [])

  return (
    <div className="app">
      <Header 
        gameState={gameState}
        onShowLeaderboard={handleShowLeaderboard}
        onBackToStart={handleBackToStart}
      />
      
      <main className="app-main">
        {gameState === 'start' && (
          <StartScreen 
            onStartGame={handleStartGame}
            onShowLeaderboard={handleShowLeaderboard}
            playerName={playerName}
            setPlayerName={setPlayerName}
          />
        )}
        
        {gameState === 'playing' && (
          <GameBoard 
            playerName={playerName}
            onGameOver={handleGameOver}
          />
        )}
        
        {gameState === 'gameover' && (
          <GameOverScreen 
            gameData={lastGameData}
            playerName={playerName}
            onPlayAgain={() => handleStartGame(playerName)}
            onShowLeaderboard={handleShowLeaderboard}
            onBackToStart={handleBackToStart}
          />
        )}
        
        {gameState === 'leaderboard' && (
          <Leaderboard 
            onBackToStart={handleBackToStart}
            onPlayAgain={() => handleStartGame(playerName)}
          />
        )}
      </main>
    </div>
  )
}

export default App
