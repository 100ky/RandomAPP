import React, { useEffect, useState, useCallback } from 'react';
import baseStyles from '../styles/ScreenBase.module.css';
import loadingStyles from '../styles/LoadingScreen.module.css';
import { useEnhancedOrientation } from '../hooks/useEnhancedOrientation';

const LoadingScreen: React.FC = () => {  const [loadingProgress, setLoadingProgress] = useState(0);
  const [adventureQuote, setAdventureQuote] = useState('');
  const { isLandscape, isAndroid, isSamsung, isLowPerformance } = useOrientation();

  // Seznam dobrodružných citátů
  const adventureQuotes = [
    "Dobrodružství čeká za každým rohem...",
    "Připrav se na výzvu, která prověří tvůj důvtip!",
    "Rozluštíš všechny záhady?",
    "Tajemství města čeká na své objevení.",
    "Odvážným štěstí přeje!",
    "Každá hádanka tě přiblíží k cíli.",
    "Dobrodružství začíná tam, kde končí jistota.",
    "Vydej se na cestu za pokladem!",
  ];

  // Efekt pro simulaci načítání a změnu citátu
  useEffect(() => {
    // Nastaví výchozí citát při načtení
    setAdventureQuote(adventureQuotes[Math.floor(Math.random() * adventureQuotes.length)]);
    
    // Interval pro načítací lištu
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const next = prev + Math.random() * 8;
        return next > 100 ? 100 : next;
      });
    }, 300);
    
  // Interval pro změnu citátu - prodlouženo na 6 sekund
    const quoteInterval = setInterval(() => {
      setAdventureQuote(adventureQuotes[Math.floor(Math.random() * adventureQuotes.length)]);
    }, 6000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(quoteInterval);
    };
  }, []);  
  
  // Metoda pro získání tříd obsahu podle orientace a zařízení pomocí useCallback pro optimalizaci  
  const getContentClasses = useCallback(() => {
    let classes = `${baseStyles.content} ${baseStyles.adventureCorner}`;
    
    // Přidáváme třídy pro orientaci
    classes += isLandscape ? ` ${baseStyles.landscapeContent}` : ` ${baseStyles.portraitContent}`;
    
    // Přidáváme třídy pro speciální typy zařízení
    if (isSamsung && isLandscape) {
      classes += ` ${loadingStyles.samsungLandscape}`;
    }
    
    if (isLowPerformance) {
      classes += ` ${loadingStyles.optimizedPerformance}`;
    }
    
    return classes;
  }, [isLandscape, isSamsung, isLowPerformance, baseStyles.content, baseStyles.adventureCorner, 
      baseStyles.landscapeContent, baseStyles.portraitContent, 
      loadingStyles.samsungLandscape, loadingStyles.optimizedPerformance]);
  return (
    <div className={`${baseStyles.fullScreen} ${baseStyles.fadeIn} 
      ${isAndroid ? baseStyles.androidOptimized : ''} 
      ${isLowPerformance ? baseStyles.lowPerformanceMode : ''}
      ${isSamsung && isLandscape ? baseStyles.samsungLandscapeMode : ''}`}>
      <div className={getContentClasses()}>
        <div className={baseStyles.compass}>
          <div className={baseStyles.needle}></div>
        </div>
        
        <div className={loadingStyles.loadingContent}>
          <h1 className={baseStyles.title}>Načítání dobrodružství</h1>
          <p className={loadingStyles.quote}>{adventureQuote}</p>
          
          <div className={baseStyles.progressContainer}>
            <div 
              className={baseStyles.progressBar} 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className={loadingStyles.percentage}>{Math.round(loadingProgress)}%</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;