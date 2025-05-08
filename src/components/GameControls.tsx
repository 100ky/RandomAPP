/**
 * Komponenta GameControls - Poskytuje základní ovládací prvky pro hru
 * 
 * Tato komponenta zobrazuje tlačítka pro spuštění a zastavení hry.
 * Zobrazuje buď tlačítko "Start Game" nebo "Stop Game" v závislosti 
 * na aktuálním stavu hry (zda je spuštěná nebo ne).
 */
import React from 'react';

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
    return (
        <div className={`game-controls ${isGameRunning ? 'game-running' : 'game-not-running'}`}>
            {!isGameRunning ? (
                <button 
                    className="game-button start-button"
                    onClick={onStart}
                >
                    Start Game
                </button>
            ) : (
                <button 
                    className="game-button stop-button hidden-control"
                    onClick={onStop}
                >
                    Stop Game
                </button>
            )}
        </div>
    );
};

export default GameControls;