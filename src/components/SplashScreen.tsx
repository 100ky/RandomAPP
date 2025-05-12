import React, { useEffect, useState, useCallback } from 'react';
import baseStyles from '../styles/ScreenBase.module.css';
import splashStyles from '@/styles/SplashScreen.module.css';
import { useEnhancedOrientation } from '../hooks/useEnhancedOrientation';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isLandscape, isAndroid, isSamsung, isLowPerformance } = useOrientation();
  
  // Přidáme přizpůsobení pro výšku/orientaci obrazovky jako optimalizovaný useCallback
  const getContentClasses = useCallback(() => {
    let classes = `${baseStyles.content} ${baseStyles.adventureCorner} ${isLoaded ? splashStyles.loaded : ''}`;
    
    // Přidáváme třídy pro orientaci
    classes += isLandscape ? ` ${baseStyles.landscapeContent}` : ` ${baseStyles.portraitContent}`;
    
    // Přidáváme třídy pro speciální typy zařízení
    if (isSamsung && isLandscape) {
      classes += ` ${splashStyles.samsungLandscape}`;
    }
    
    if (isLowPerformance) {
      classes += ` ${splashStyles.optimizedPerformance}`;
    }
    
    return classes;
  }, [isLandscape, isLoaded, isSamsung, isLowPerformance, baseStyles.content, baseStyles.adventureCorner, 
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
      ${isAndroid ? baseStyles.androidOptimized : ''} 
      ${isLowPerformance ? baseStyles.lowPerformanceMode : ''} 
      ${isSamsung && isLandscape ? baseStyles.samsungLandscapeMode : ''}`}>
      <div className={getContentClasses()}>
        <div className={baseStyles.compass}>
          <div className={baseStyles.needle}></div>
        </div>
        
        <div className={splashStyles.textContent}>
          <h1 className={baseStyles.title}>
            Úniková hra
          </h1>
          <h2 className={baseStyles.subtitle}>
            Vysoké Mýto
          </h2>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;