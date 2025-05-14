import React, { useEffect, useState, useCallback } from 'react';
import baseStyles from '../styles/ScreenBase.module.css';
import loadingStyles from '../styles/LoadingScreen.module.css';
import { useEnhancedOrientation } from '../hooks/useEnhancedOrientation';

const LoadingScreen: React.FC = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [adventureQuote, setAdventureQuote] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { isLandscape, isAndroid, isSamsung, isLowPerformance } = useEnhancedOrientation();

  // Používáme useEffect pro nastavení klientského renderování
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Seznam historických citátů a faktů o Vysokém Mýtě
  const adventureQuotes = [
    "Vysoké Mýto založil král Přemysl Otakar II. roku 1262.",
    "Náměstí Přemysla Otakara II. patří k nejrozlehlejším ve východních Čechách.",
    "Chrám sv. Vavřince ukrývá největší obraz Petra Brandla v Čechách.",
    "Městské opevnění Vysokého Mýta bylo dlouhé přes 1,5 kilometru.",
    "Choceňská věž Karaska je pojmenována po pražském mistru tesaři.",
    "Mariánský sloup byl postaven roku 1714 na památku ústupu moru.",
    "Pražská brána je jednou ze tří dochovaných bran města.",
    "Socha Přemysla Otakara II. je historicky první sochou tohoto krále v ČR.",
    "Městské hradby Vysokého Mýta byly vystavěny z opuky.",
    "V roce 1897 byl nalezen ve městě poklad 700 stříbrných mincí.",
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
    
    // Přidáváme třídy pro orientaci pouze na klientovi
    // Na serveru vždy použijeme portrait, abychom předešli hydratačním chybám
    if (!isClient) {
      classes += ` ${baseStyles.portraitContent}`;
    } else {
      classes += isLandscape ? ` ${baseStyles.landscapeContent}` : ` ${baseStyles.portraitContent}`;
      
      // Přidáváme třídy pro speciální typy zařízení - pouze na klientovi
      if (isSamsung && isLandscape) {
        classes += ` ${loadingStyles.samsungLandscape}`;
      }
      
      if (isLowPerformance) {
        classes += ` ${loadingStyles.optimizedPerformance}`;
      }
    }
    
    return classes;
  }, [isClient, isLandscape, isSamsung, isLowPerformance, baseStyles.content, baseStyles.adventureCorner, 
      baseStyles.landscapeContent, baseStyles.portraitContent, 
      loadingStyles.samsungLandscape, loadingStyles.optimizedPerformance]);  return (
    <div className={`${baseStyles.fullScreen} ${baseStyles.fadeIn} adventure-bg
      ${isClient && isAndroid ? baseStyles.androidOptimized : ''} 
      ${isClient && isLowPerformance ? baseStyles.lowPerformanceMode : ''}
      ${isClient && isSamsung && isLandscape ? baseStyles.samsungLandscapeMode : ''}`}>
      <div className="loading-clouds"></div>      <div className={getContentClasses()}>
        <div className={`${baseStyles.compass} compass-container`}>
          <div className={baseStyles.needle}></div>
        </div>
        
        <div className={loadingStyles.loadingContent}>
          <h1 className={baseStyles.title}>Příprava průzkumu</h1>
          <p className={loadingStyles.quote}>{adventureQuote}</p>
          <div className={loadingStyles.locationInfo}>Objevte historické tajemství Vysokého Mýta</div>
          
          <div className="adventure-map-scroll">
            <div className="adventure-map-content">
              <div className="adventure-map-path"></div>
              <div className="adventure-map-marker"></div>
              <div className="adventure-map-treasure"></div>
            </div>
            <div className="adventure-map-rolls">
              <div className="adventure-map-top-roll"></div>
              <div className="adventure-map-bottom-roll"></div>
            </div>
          </div>
          
          <div className="adventure-progress-container">
            <div 
              className="adventure-progress-bar" 
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