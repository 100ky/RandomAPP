/**
 * Komponenta Compass - Zobrazuje kompas s určením světových stran
 * 
 * Tato komponenta využívá senzory zařízení (deviceorientation) pro zobrazení
 * kompasu, který ukazuje na sever. Umožňuje zobrazení v minimální a rozšířené verzi.
 * Kompas reaguje na orientaci zařízení a poskytuje uživateli vizuální zpětnou vazbu o přesnosti.
 */
import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Compass.module.css';
import compassAnimations from '../styles/CompassAnimations.module.css';
import useCompass from '../hooks/useCompassNew';
import useOrientation from '../hooks/useOrientation';

interface CompassProps {
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const Compass: React.FC<CompassProps> = ({ 
  isExpanded = false, 
  onToggleExpanded 
}): React.ReactElement => {
  // Použití vlastního hooku pro kompas
  const { 
    heading, 
    accuracy: compassAccuracy, 
    isDeviceMoving, 
    isCalibrated,
    requestPermission 
  } = useCompass(0.2, 100); // vyhlazovací faktor a interval aktualizace v ms
  
  // Získáme informace o orientaci zařízení
  const { isLandscape } = useOrientation();
  
  // Stav pro animaci dotykové zpětné vazby
  const [isTapped, setIsTapped] = useState(false);
  
  // Stav pro již vyžádaná oprávnění
  const [permissionRequested, setPermissionRequested] = useState(false);
  
  // Stav pro zobrazení informace o povolení senzorů
  const [showPermissionTooltip, setShowPermissionTooltip] = useState(false);
  
  // Stav pro zobrazení nápovědy ke kalibraci
  const [showCalibrationHelp, setShowCalibrationHelp] = useState(false);

  // Efekt pro vyžádání povolení, když je komponenta poprvé zobrazena
  useEffect(() => {
    if (!permissionRequested) {
      // Pokusíme se získat povolení při prvním načtení
      requestPermission()
        .then((granted) => {
          setPermissionRequested(true);
          if (!granted) {
            // Pokud nebylo povolení uděleno, zobrazíme tooltip
            setShowPermissionTooltip(true);
            setTimeout(() => setShowPermissionTooltip(false), 4000);
          }
        })
        .catch(error => {
          console.error('Chyba při žádosti o povolení senzorů:', error);
          setShowPermissionTooltip(true);
          setTimeout(() => setShowPermissionTooltip(false), 4000);
        });
    }
  }, [permissionRequested, requestPermission]);

  // Efekt reagující na rozbalení kompasu - znovu požádáme o oprávnění, pokud bude potřeba
  useEffect(() => {
    if (isExpanded && permissionRequested) {
      requestPermission().catch(console.error);
    }
  }, [isExpanded, permissionRequested, requestPermission]);
  
  // Funkce pro zpracování kliknutí na kompas
  const handleCompassClick = useCallback(() => {
    // Animace doteku
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 300);
    
    // Volání funkce pro přepnutí rozbalovacího stavu
    if (onToggleExpanded) {
      onToggleExpanded();
    } else if (!permissionRequested) {
      // Pokud ještě nebylo požádáno o povolení, zkusíme o něj požádat
      requestPermission().then((granted) => {
        setPermissionRequested(true);
        if (!granted) {
          setShowPermissionTooltip(true);
          setTimeout(() => setShowPermissionTooltip(false), 4000);
        }
      });
    }
  }, [onToggleExpanded, permissionRequested, requestPermission]);

  // Vykreslí kompas podle toho, zda je rozbalený nebo ne
  if (isExpanded) {
    return (
      <div 
        className={`
          ${styles.expandedCompass} 
          ${isLandscape ? styles.landscapeSpecificAdjustments : ''} /* Použití lokální třídy pro specifické úpravy */
          ${compassAnimations.expandingCompass}
        `} 
        onClick={handleCompassClick}
      >
        <button 
          className={styles.closeExpandedCompass} 
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleExpanded) onToggleExpanded();
          }}
          aria-label="Zavřít kompas"
        >
          &times;
        </button>
        <div 
          className={`
            ${styles.compassRose} 
            ${!isCalibrated && compassAnimations.calibratingCompass}
          `} 
          style={{ transform: `rotate(${heading !== null ? -heading : 0}deg)` }}
        >
          <div className={styles.compassCircle}>
            <div className={styles.compassDirection} data-direction="N">S</div>
            <div className={styles.compassDirection} data-direction="E">V</div>
            <div className={styles.compassDirection} data-direction="S">J</div>
            <div className={styles.compassDirection} data-direction="W">Z</div>
            <div className={styles.compassMarker}></div>
          </div>
          <div className={styles.compassNeedle}></div>
          <div className={styles.compassCenterDot}></div>
        </div>
        <div className={styles.compassInfo}>
          <div className={styles.compassHeading}>
            {heading !== null ? Math.round(heading) + '°' : '--°'}
          </div>
          <div className={`${styles.compassAccuracy} ${styles[`accuracy_${compassAccuracy}`]}`}>
            {compassAccuracy === 'high' ? 'Přesný' : 
             compassAccuracy === 'medium' ? 'Střední přesnost' : 
             compassAccuracy === 'low' ? 'Nízká přesnost' : 'Kalibruje se...'}
          </div>
          {(isDeviceMoving || showCalibrationHelp) && (
            <div className={styles.movingIndicator}>
              Pohybujte telefonem v osmičce pro kalibraci
              <div className={compassAnimations.calibrationAnimation}>
                <span className={styles.calibrationIcon}>↻</span>
              </div>
            </div>
          )}
          <button 
            className={styles.calibrateButton} 
            onClick={(e) => {
              e.stopPropagation();
              setShowCalibrationHelp(true);
              setTimeout(() => setShowCalibrationHelp(false), 5000);
            }}
            aria-label="Zobrazit nápovědu ke kalibraci"
          >
            Kalibrovat
          </button>
        </div>
      </div>
    );
  }
  
  // Minimální verze kompasu (malá ikona pod avatarem)
  return (
    <div 
      className={`${styles.compass} ${isTapped ? compassAnimations.tappedCompass : ''}`} 
      onClick={handleCompassClick}
      aria-label="Kompas - klikněte pro rozbalení"
    >
      <div 
        className={`
          ${styles.compassMini} 
          ${!isCalibrated && compassAnimations.calibratingCompass}
        `} 
        style={{ transform: `rotate(${heading !== null ? -heading : 0}deg)` }}
      >
        <div className={styles.compassNeedleMini}></div>
      </div>
      {showPermissionTooltip && (
        <div className={styles.permissionTooltip}>
          Klikněte pro povolení senzorů kompasu
        </div>
      )}
    </div>
  );
};

export default Compass;
