import React, { useEffect, useState } from 'react';

const LoadingScreen: React.FC = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [adventureQuote, setAdventureQuote] = useState('');

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

  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-adventure-elements">
          <div className="compass">
            <div className="needle"></div>
            <div className="compass-center"></div>
          </div>
          <div className="map-scroll"></div>
          <div className="planet"></div>
        </div>
        <div className="loading-text-container">
          <div className="loading-title">Připravte se na dobrodružství!</div>
          <div className="loading-quote">{adventureQuote}</div>
          <div className="loading-progress-container">
            <div className="loading-progress-bar">
              <div 
                className="loading-progress-fill"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="loading-percentage">{Math.round(loadingProgress)}%</div>
          </div>
          <div className="loading-text">Načítání únikové hry...</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;