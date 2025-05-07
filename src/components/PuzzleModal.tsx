import React, { useState, useEffect } from 'react';
import { Puzzle } from '../types/game';
import { updateSolvedPuzzle, isPuzzleSolved, getTotalPoints } from '../utils/progressTracker';
import FullscreenToggle from './FullscreenToggle';

interface PuzzleModalProps {
  puzzle: Puzzle | null;
  onClose: () => void;
  onSolve?: (puzzleId: string, points: number) => void;
}

const PuzzleModal: React.FC<PuzzleModalProps> = ({ puzzle, onClose, onSolve }) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<null | { correct: boolean; message: string }>(null);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [timeTaken, setTimeTaken] = useState<number>(0);
  
  // Nový stav pro režim na šířku
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  useEffect(() => {
    // Resetovat stav při změně hádanky
    setAnswer('');
    setFeedback(null);
    setShowHints(false);
    setCurrentHintIndex(0);
    setAttempts(0);
    setSolved(false);
    setIsFullscreenMode(false);

    // Kontrola, zda je hádanka již vyřešena
    if (puzzle) {
      const alreadySolved = isPuzzleSolved(puzzle.id);
      if (alreadySolved) {
        setSolved(true);
      }
    }

    // Spustit časovač pro sledování doby řešení
    const timer = setInterval(() => {
      setTimeTaken(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [puzzle, startTime]);

  // Když není předána žádná hádanka, nezobrazovat nic
  if (!puzzle) return null;
  
  // Obsluha přepínání režimu zobrazení
  const handleFullscreenToggle = (isFullscreen: boolean) => {
    setIsFullscreenMode(isFullscreen);
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Normalizace odpovědi pro porovnání (malá písmena, odstranění mezer)
    const normalizedAnswer = answer.toLowerCase().trim();
    const normalizedCorrectAnswer = puzzle.answer.toLowerCase().trim();

    // Zvýšit počet pokusů
    setAttempts(attempts + 1);

    // Kontrola odpovědi
    if (normalizedAnswer === normalizedCorrectAnswer) {
      setFeedback({
        correct: true,
        message: 'Správně! Hádanka byla vyřešena.'
      });

      // Aktualizovat herní postup pouze pokud hádanka ještě nebyla vyřešena
      if (!solved) {
        updateSolvedPuzzle(puzzle.id, puzzle.points);
        setSolved(true);
        
        // Zavolat callback, pokud byl poskytnut
        if (onSolve) {
          onSolve(puzzle.id, puzzle.points);
        }
      }
    } else {
      // Nesprávná odpověď
      setFeedback({
        correct: false,
        message: 'Bohužel, tato odpověď není správná. Zkus to znovu.'
      });
    }
  };

  const showNextHint = () => {
    if (currentHintIndex < puzzle.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  // Formátování času
  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes}m ${seconds}s`;
  };

  // Zjistit obtížnost hádanky
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'easy';
      case 'medium': return 'medium';
      case 'hard': return 'hard';
      default: return '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`puzzle-modal ${isFullscreenMode ? 'puzzle-fullscreen' : ''}`} 
        onClick={(e) => e.stopPropagation()}
        id="puzzle-content"
      >
        <button className="close-button" onClick={onClose}>×</button>
        
        {/* Hlavička hádanky */}
        <div className="puzzle-header">
          <h2>{puzzle.title}</h2>
          <div className="puzzle-difficulty">
            <span className={`difficulty ${getDifficultyClass(puzzle.difficulty)}`}>
              {puzzle.difficulty === 'easy' ? 'Lehká' : 
               puzzle.difficulty === 'medium' ? 'Střední' : 'Těžká'}
            </span>
          </div>
        </div>

        {/* Obrázek hádanky (pokud existuje) */}
        {puzzle.image && (
          <div className="puzzle-image-container">
            <img 
              src={puzzle.image} 
              alt={puzzle.title} 
              className="puzzle-image"
            />
            {/* Přidat fullscreen toggle pokud je obrázek */}
            <FullscreenToggle 
              targetId="puzzle-content"
              type="camera"
              onToggle={handleFullscreenToggle}
            />
          </div>
        )}

        {/* Obsah hádanky */}
        <div className="puzzle-content">
          <div className="puzzle-description">{puzzle.description}</div>
          <div className="puzzle-question">{puzzle.question}</div>
        </div>

        {/* Sekce pro odpověď (pouze pokud hádanka není vyřešena) */}
        {!solved ? (
          <>
            <form onSubmit={handleAnswerSubmit}>
              <div className="answer-section">
                <input
                  type="text"
                  className="answer-input"
                  placeholder="Zadej svou odpověď..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={!answer.trim()}
                >
                  Odeslat
                </button>
              </div>
            </form>

            {/* Zpětná vazba po odpovědi */}
            {feedback && (
              <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
                {feedback.message}
              </div>
            )}

            {/* Sekce s nápovědami */}
            <div className="hints-section">
              {!showHints ? (
                <button 
                  className="hint-button" 
                  onClick={() => setShowHints(true)}
                >
                  Potřebuji nápovědu
                </button>
              ) : (
                <div className="hint-container">
                  <div className="hint-label">Nápověda {currentHintIndex + 1} z {puzzle.hints.length}:</div>
                  <div className="hint-text">{puzzle.hints[currentHintIndex]}</div>
                  
                  {currentHintIndex < puzzle.hints.length - 1 && (
                    <button 
                      className="next-hint-button"
                      onClick={showNextHint}
                    >
                      Další nápověda
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Statistiky hádanky */}
            <div className="puzzle-stats">
              <div className="stat">
                <span className="stat-label">Hodnota:</span>
                <span className="stat-value">{puzzle.points} bodů</span>
              </div>
              <div className="stat">
                <span className="stat-label">Pokusy:</span>
                <span className="stat-value">{attempts}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Čas:</span>
                <span className="stat-value">{formatTime(timeTaken)}</span>
              </div>
            </div>
          </>
        ) : (
          /* Zobrazení po vyřešení hádanky */
          <div className="puzzle-solved">
            <div className="success-message">Hádanka úspěšně vyřešena!</div>
            <p>Získal jsi {puzzle.points} bodů.</p>
            <p>Celkové skóre: {getTotalPoints()} bodů</p>
            <button className="continue-button" onClick={onClose}>
              Pokračovat
            </button>
          </div>
        )}
        
        {/* Informace o už vyřešené hádance (pokud přijde hráč znovu) */}
        {solved && !feedback?.correct && (
          <div className="already-solved">
            <p>Tuto hádanku jsi již vyřešil.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleModal;