/**
 * Komponenta GameControls - Poskytuje základní ovládací prvky pro hru
 * 
 * Tato komponenta zobrazuje tlačítka pro spuštění a zastavení hry.
 * Zobrazuje buď tlačítko "Start Game" nebo "Stop Game" v závislosti 
 * na aktuálním stavu hry (zda je spuštěná nebo ne).
 */
import React, { useState, useEffect } from 'react';

/**
 * Komponenta pro ovládání hry pomocí tlačítek start/stop
 * 
 * @param onStart - Funkce volaná při kliknutí na tlačítko Start Game
 * @param onStop - Funkce volaná při kliknutí na tlačítko Stop Game
 * @param isGameRunning - Boolean určující, zda je hra aktuálně spuštěná
 */
const GameControls: React.FC<{ onStart: () => void; onStop: () => void; isGameRunning?: boolean }> = ({ 
  onStart, 
  onStop, 
  isGameRunning = false 
}) => {
    const [isHover, setIsHover] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [showPulse, setShowPulse] = useState(true);
    
    // Efekt pulzu pro tlačítko start, který se opakuje každých 5 sekund
    useEffect(() => {
        if (!isGameRunning) {
            const pulseInterval = setInterval(() => {
                setShowPulse(true);
                setTimeout(() => {
                    setShowPulse(false);
                }, 2000);
            }, 5000);
            
            return () => {
                clearInterval(pulseInterval);
            };
        }
    }, [isGameRunning]);

    const handleMouseEnter = () => {
        setIsHover(true);
    };

    const handleMouseLeave = () => {
        setIsHover(false);
        setIsPressed(false);
    };

    const handleMouseDown = () => {
        setIsPressed(true);
    };

    const handleMouseUp = () => {
        setIsPressed(false);
    };

    return (
        <div className={`game-controls ${isGameRunning ? 'game-running' : 'game-not-running'}`}>
            {!isGameRunning ? (
                <button 
                    className={`game-button start-button ${showPulse ? 'pulse-animation' : ''} ${isHover ? 'hover' : ''} ${isPressed ? 'active' : ''}`}
                    onClick={onStart}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchEnd={handleMouseUp}
                >
                    <div className="button-content">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="start-icon">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span>Start Game</span>
                    </div>
                    <div className="button-glow"></div>
                </button>
            ) : (
                <button 
                    className="game-button stop-button hidden-control"
                    onClick={onStop}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="button-content">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M6 6h12v12H6z"/>
                        </svg>
                        <span>Stop Game</span>
                    </div>
                </button>
            )}
        </div>
    );
};

export default GameControls;