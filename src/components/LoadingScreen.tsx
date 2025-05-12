import React, { useEffect, useState } from 'react';
import styles from '../styles/LoadingScreen.module.css';
import compassStyles from '../styles/CompassExtras.module.css';
import mapStyles from '../styles/MapScroll.module.css';
import planetStyles from '../styles/Planet.module.css';
import titleStyles from '../styles/LoadingTitle.module.css';
import progressStyles from '../styles/LoadingProgress.module.css';
import textStyles from '../styles/LoadingText.module.css';
import parchmentStyles from '../styles/ParchmentEffect.module.css';
import sceneStyles from '../styles/AdventureScene.module.css';

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
    <div className={styles.loadingScreen}>
      <div className={`${styles.loadingContainer} ${parchmentStyles.loadingContainerParchment}`}>
        <div className={parchmentStyles.loadingParchmentContainer}>
        <div className={styles.loadingAdventureElements}>
          <div className={styles.compass}>
            <div className={compassStyles.compassRose}></div>
            <div className={styles.needle}></div>
            <div className={styles.compassCenter}></div>
            <div className={compassStyles.compassMarkings}>
              <span className={compassStyles.compassN}>N</span>
              <span className={compassStyles.compassE}>E</span>
              <span className={compassStyles.compassS}>S</span>
              <span className={compassStyles.compassW}>W</span>
            </div>
          </div>
          <div className={styles.mapScroll}>
            <div className={mapStyles.mapContent}>
              <div className={mapStyles.mapPath}></div>
              <div className={mapStyles.mapMarker}></div>
              <div className={mapStyles.mapTreasure}></div>
            </div>
            <div className={mapStyles.mapRolls}>
              <div className={mapStyles.mapTopRoll}></div>
              <div className={mapStyles.mapBottomRoll}></div>
            </div>
          </div>
          <div className={styles.planet}>
            <div className={planetStyles.planetRings}></div>
            <div className={planetStyles.planetClouds}></div>
            <div className={planetStyles.planetSurface}></div>
          </div>
        </div>
        <div className={styles.loadingTextContainer}>
          <div className={styles.loadingTitle}>
            <span className={titleStyles.titleWord}>Připravte</span>
            <span className={titleStyles.titleWord}>se</span>
            <span className={titleStyles.titleWord}>na</span>
            <span className={titleStyles.titleAccent}>dobrodružství!</span>
          </div>
          <div className={styles.loadingQuote}>{adventureQuote}</div>
          <div className={styles.loadingProgressContainer}>
            <div className={styles.loadingProgressBar}>
              <div 
                className={styles.loadingProgressFill}
                style={{ width: `${loadingProgress}%` }}
              >
                <div className={progressStyles.loadingProgressParticles}></div>
              </div>
            </div>
            <div className={`${styles.loadingPercentage} ${progressStyles.loadingPercentageEnhanced}`}>
              {Math.round(loadingProgress)}
            </div>
          </div>
          <div className={styles.loadingText}>
            Načítání únikové hry
            <span className={textStyles.ellipsis}><span>.</span><span>.</span><span>.</span></span>
            <span className={textStyles.analogicLookingText}>v1.2</span>
            
            <div className={sceneStyles.adventureScene}>
              <div className={sceneStyles.sceneMountain}></div>
              <div className={sceneStyles.sceneSun}></div>
              <div className={sceneStyles.sceneCharacter}></div>
              <div className={sceneStyles.sceneFlag}></div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;