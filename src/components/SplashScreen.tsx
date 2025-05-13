import React, { useEffect, useState, useCallback } from 'react';
import baseStyles from '../styles/ScreenBase.module.css';
import splashStyles from '@/styles/SplashScreen.module.css';
import { useEnhancedOrientation } from '../hooks/useEnhancedOrientation';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { isLandscape, isAndroid, isSamsung, isLowPerformance } = useEnhancedOrientation();
  
  // Používáme useEffect pro nastavení klientského renderování
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Přidáme přizpůsobení pro výšku/orientaci obrazovky jako optimalizovaný useCallback
  const getContentClasses = useCallback(() => {
    let classes = `${baseStyles.content} ${baseStyles.adventureCorner} ${isLoaded ? splashStyles.loaded : ''}`;
    
    // Přidáváme třídy pro orientaci pouze na klientovi
    // Na serveru vždy použijeme portrait, abychom předešli hydratačním chybám
    if (!isClient) {
      classes += ` ${baseStyles.portraitContent}`;
    } else {
      classes += isLandscape ? ` ${baseStyles.landscapeContent}` : ` ${baseStyles.portraitContent}`;
      
      // Přidáváme třídy pro speciální typy zařízení - pouze na klientovi
      if (isSamsung && isLandscape) {
        classes += ` ${splashStyles.samsungLandscape}`;
      }
      
      if (isLowPerformance) {
        classes += ` ${splashStyles.optimizedPerformance}`;
      }
    }
    
    return classes;
  }, [isClient, isLandscape, isLoaded, isSamsung, isLowPerformance, baseStyles.content, baseStyles.adventureCorner, 
      baseStyles.landscapeContent, baseStyles.portraitContent, splashStyles.loaded, 
      splashStyles.samsungLandscape, splashStyles.optimizedPerformance]);

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
    <div className={`${baseStyles.fullScreen} ${baseStyles.fadeIn} ${isExiting ? baseStyles.fadeOut : ''} 
      ${isClient && isAndroid ? baseStyles.androidOptimized : ''} 
      ${isClient && isLowPerformance ? baseStyles.lowPerformanceMode : ''} 
      ${isClient && isSamsung && isLandscape ? baseStyles.samsungLandscapeMode : ''}`}>
      <div className={getContentClasses()}>
        <div className={baseStyles.compass}>
          <div className={baseStyles.needle}></div>
        </div>
        
        <div className={splashStyles.textContent}>
          <h1 className={baseStyles.title}>
            Průzkumník
          </h1>
          <h2 className={baseStyles.subtitle}>
            Vysokého Mýta
          </h2>
          <p className={splashStyles.description}>
            Objevte tajemství královského města
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;