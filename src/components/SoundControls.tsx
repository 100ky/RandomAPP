/**
 * Komponenta SoundControls - Ovládací prvky pro nastavení zvuku
 * 
 * Tato komponenta poskytuje jednoduchý přepínač pro zapnutí/vypnutí zvuku.
 * Pro mobilní zařízení je vhodnější pouze tlačítko bez posuvníku hlasitosti.
 */
import React, { useState, useEffect } from 'react';
import { SoundManager, SoundType } from '../utils/SoundManager';
import styles from '../styles/SoundControls.module.css';

/**
 * Komponenta pro ovládání zvuku v aplikaci
 */
const SoundControls: React.FC = () => {
    // Získat instanci SoundManager
    const soundManager = SoundManager.getInstance();
    
    // Stav pro sledování zapnutí/vypnutí zvuku
    const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(soundManager.isEnabled());
    
    // Efekt pro inicializaci stavu ze SoundManager
    useEffect(() => {
        setIsSoundEnabled(soundManager.isEnabled());
    }, []);
    
    /**
     * Přepíná stav zapnutí/vypnutí zvuku s haptickou a vizuální zpětnou vazbou
     */
    const handleToggleSound = () => {
        const newState = !isSoundEnabled;
        setIsSoundEnabled(newState);
        soundManager.setEnabled(newState);
        
        // Pokud zvuk zapínáme, nastavit výchozí hlasitost
        if (newState) {
            soundManager.setVolume(0.7); // Fixní střední hlasitost
            
            // Přehrát krátký zvuk jako potvrzení zapnutí (s mírným zpožděním)
            setTimeout(() => {
                soundManager.play(SoundType.STEP, { volume: 0.4 });
            }, 100);
            
            // Zkusit vibraci na mobilních zařízeních, pokud je dostupná
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
        }
    };
     return (
        <div className={styles.soundControls}>
            <button
                className={`${styles.soundToggle} ${isSoundEnabled ? styles.soundOn : styles.soundOff}`}
                onClick={handleToggleSound}
                title={isSoundEnabled ? 'Vypnout zvuk' : 'Zapnout zvuk'}
                aria-label={isSoundEnabled ? 'Vypnout zvuk' : 'Zapnout zvuk'}
            >
                {isSoundEnabled ? (
                    // Ikona pro zapnutý zvuk
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                ) : (
                    // Ikona pro vypnutý zvuk
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                )}
            </button>
        </div>
    );
};

export default SoundControls;
