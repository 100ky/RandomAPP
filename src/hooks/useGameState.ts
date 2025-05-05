import { useState, useEffect } from 'react';

const useGameState = () => {
    const [level, setLevel] = useState(1);
    const [progress, setProgress] = useState(0);
    const [isGameActive, setIsGameActive] = useState(false);

    const startGame = () => {
        setIsGameActive(true);
        setProgress(0);
        setLevel(1);
    };

    const endGame = () => {
        setIsGameActive(false);
    };

    const nextLevel = () => {
        setLevel(prevLevel => prevLevel + 1);
        setProgress(0);
    };

    const updateProgress = (increment: number) => {
        setProgress(prevProgress => Math.min(prevProgress + increment, 100));
    };

    useEffect(() => {
        if (progress >= 100) {
            nextLevel();
        }
    }, [progress]);

    return {
        level,
        progress,
        isGameActive,
        startGame,
        endGame,
        updateProgress,
    };
};

export default useGameState;