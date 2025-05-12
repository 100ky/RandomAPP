import React, { useEffect, useState } from 'react';
import styles from '@/styles/SplashScreen.module.css';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Nejprve načíst obsah
    setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    // Nastavíme časovač pro zobrazení splashscreenu (2 sekundy)
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Přidáme další timeout pro animaci odchodu
      setTimeout(onFinish, 800);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`${styles.splashScreen} adventure-background ${isExiting ? styles.fadeOut : ''}`}>
      <div className={`${styles.content} adventure-corner ${isLoaded ? styles.loaded : ''}`}>
        <div className={styles.compassWrapper}>
          <div className={styles.compass}>
            <div className={styles.needle}></div>
          </div>
        </div>
        <div className={styles.titleContainer}>
          <h1 className={`${styles.title} adventure-title`}>
            <span className="adventure-underline">Úniková hra</span>
          </h1>
          <div className={styles.subtitleWrapper}>
            <h2 className={`${styles.subtitle} adventure-title`} style={{animationDelay: '0.3s'}}>
              Vysoké Mýto
            </h2>
          </div>
        </div>
        <div className={styles.decorationElement}></div>
      </div>
    </div>
  );
};

export default SplashScreen;