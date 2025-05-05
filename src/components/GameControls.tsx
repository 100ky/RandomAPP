import React from 'react';

const GameControls: React.FC<{ onStart: () => void; onStop: () => void; isGameRunning?: boolean }> = ({ 
  onStart, 
  onStop, 
  isGameRunning = false 
}) => {
    return (
        <div className="game-controls">
            {!isGameRunning ? (
                <button 
                    className="game-button start-button"
                    onClick={onStart}
                >
                    Start Game
                </button>
            ) : (
                <button 
                    className="game-button stop-button"
                    onClick={onStop}
                >
                    Stop Game
                </button>
            )}
        </div>
    );
};

export default GameControls;