import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import baseStyles from '../styles/ScreenBase.module.css';
import styles from '@/styles/LogoScreen.module.css';
import { useEnhancedOrientation } from '../hooks/useEnhancedOrientation';

interface LogoScreenProps {
  onContinue: () => void;
}

const LogoScreen: React.FC<LogoScreenProps> = ({ onContinue }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { isLandscape, isAndroid, isSamsung, isLowPerformance } = useEnhancedOrientation();    // Používáme useEffect pro nastavení klientského renderování
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Přidáme přizpůsobení pro výšku/orientaci obrazovky jako optimalizovaný useCallback
  const getContentClasses = useCallback(() => {
    let classes = `${baseStyles.content} ${styles.logoContentContainer} ${isLoaded ? styles.loaded : ''}`;
    
    // Přidáváme třídy pro orientaci pouze na klientovi
    // Na serveru vždy použijeme portrait, abychom předešli hydratačním chybám
    if (!isClient) {
      classes += ` ${baseStyles.portraitContent}`;
    } else {
      classes += isLandscape ? 
        ` ${baseStyles.landscapeContent} ${styles.fullScreenLandscape}` : 
        ` ${baseStyles.portraitContent}`;
      
      // Přidáváme třídy pro speciální typy zařízení - pouze na klientovi
      if (isSamsung && isLandscape) {
        classes += ` ${styles.samsungLandscape}`;
      }
      
      if (isLowPerformance) {
        classes += ` ${styles.optimizedPerformance}`;
      }
    }
    
    return classes;
  }, [isClient, isLandscape, isLoaded, isSamsung, isLowPerformance]);

  useEffect(() => {
    // Nejprve načíst obsah
    setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    // Nastavíme časovač pro zobrazení loga (3 sekundy)
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Přidáme další timeout pro animaci odchodu
      setTimeout(onContinue, 800);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>      <div className={`${baseStyles.fullScreen} ${baseStyles.fadeIn} ${isExiting ? baseStyles.fadeOut : ''} 
        ${isClient && isAndroid ? baseStyles.androidOptimized : ''} 
        ${isClient && isLowPerformance ? baseStyles.lowPerformanceMode : ''}
        ${isClient && isLandscape ? 'landscape-orientation' : 'portrait-orientation'}
        ${isClient && isSamsung && isLandscape ? baseStyles.samsungLandscapeMode : ''}
        adventureBackground`}
        style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
        <div className={getContentClasses()}>
          <div className={styles.logoContainer}>            {/* Zde bude logo - prozatím prázdný div s textem */}
            <div className={styles.logoPlaceholder}>
              <h1 className={styles.logoTitle}>LOGO</h1>
              <p className={styles.logoSubtitle}>(Zde bude vaše vlastní logo)</p>
              <div className={styles.clouds}>
                <div className={`${styles.cloud} ${styles.cloud1}`}></div>
                <div className={`${styles.cloud} ${styles.cloud2}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoScreen;
