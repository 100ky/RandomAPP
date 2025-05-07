import React, { useEffect, useState } from 'react';
import styles from '@/styles/SplashScreen.module.css';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Nastavíme časovač pro zobrazení splashscreenu (1.5 sekundy)
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Přidáme další timeout pro animaci odchodu
      setTimeout(onFinish, 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`${styles.splashScreen} ${isExiting ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <div className={styles.logoPlaceholder}>
          <span>LOGO</span>
        </div>
        <h1 className={styles.title}>Úniková hra</h1>
        <h2 className={styles.subtitle}>Vysoké Mýto</h2>
      </div>
    </div>
  );
};

export default SplashScreen;