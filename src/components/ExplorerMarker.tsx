/**
 * Komponenta ExplorerMarker - Znázorňuje aktuální polohu uživatele na mapě
 * 
 * Tato komponenta vytváří animovanou ikonu průzkumníka, která reprezentuje 
 * aktuální polohu uživatele na mapě. Včetně animací a stylování,
 * které zapadá do designu aplikace.
 */
import React, { useEffect, useState } from 'react';
import styles from '../styles/ExplorerMarker.module.css';

/**
 * Props pro komponentu ExplorerMarker
 */
interface ExplorerMarkerProps {
  /** Volitelný CSS třída pro dodatečné stylování */
  className?: string;
  /** Volitelná funkce volaná při kliknutí na marker */
  onClick?: () => void;
  /** Velikost markeru v pixelech */
  size?: number;
  /** Zda je uživatel v pohybu */
  isMoving?: boolean;
  /** Volitelné nastavení rotace markeru (ve stupních) */
  rotation?: number;
  /** Volitelné nastavení pulzující animace */
  pulse?: boolean;
}

/**
 * Komponenta představující animovaného průzkumníka na mapě
 */
const ExplorerMarker: React.FC<ExplorerMarkerProps> = ({
  className = '',
  onClick,
  size = 40,
  isMoving = false,
  rotation = 0,
  pulse = true,
}) => {
  // Stav pro přepínání mezi animačními fázemi
  const [animationStep, setAnimationStep] = useState(0);

  // Efekt pro animaci chůze
  useEffect(() => {
    if (isMoving) {
      const interval = setInterval(() => {
        setAnimationStep((prev) => (prev + 1) % 4);
      }, 250);
      return () => clearInterval(interval);
    }
  }, [isMoving]);

  return (
    <div 
      className={`${styles.explorerMarkerContainer} ${className} ${pulse ? styles.pulse : ''}`}
      onClick={onClick}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        transform: `rotate(${rotation}deg)`
      }}
      role="img"
      aria-label="Vaše pozice na mapě"
    >
      <div className={`${styles.explorerMarker} ${isMoving ? styles.moving : ''}`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
          className={styles.explorerIcon}
        >
          {/* Tělo postavičky */}
          <circle cx="12" cy="7" r="4" fill="#FFD54F" className={styles.head} />
          
          {/* Obličej - jednoduchý úsměv a oči */}
          <circle cx="10.5" cy="6" r="0.8" fill="#5D4037" className={styles.eye} />
          <circle cx="13.5" cy="6" r="0.8" fill="#5D4037" className={styles.eye} />
          <path d="M10.5 8.5C11 9.3 13 9.3 13.5 8.5" stroke="#5D4037" fill="none" strokeWidth="0.6" className={styles.mouth} />
          
          {/* Tělo */}
          <rect x="9" y="11" width="6" height="8" rx="3" ry="3" fill="#26A69A" className={styles.body} />
          
          {/* Batoh */}
          <rect x="9" y="12" width="6" height="6" rx="1" ry="1" fill="#8D6E63" className={styles.backpack} />
          
          {/* Ruce */}
          <rect 
            x="7.5" y="12" 
            width="1.5" height="5" 
            rx="0.75" ry="0.75"
            fill="#FFD54F" 
            className={`${styles.arm} ${styles.leftArm} ${isMoving ? styles[`step${animationStep}`] : ''}`} 
          />
          <rect 
            x="15" y="12" 
            width="1.5" height="5" 
            rx="0.75" ry="0.75"
            fill="#FFD54F" 
            className={`${styles.arm} ${styles.rightArm} ${isMoving ? styles[`step${animationStep}`] : ''}`}
          />
          
          {/* Nohy */}
          <rect 
            x="9.5" y="19" 
            width="2" height="4" 
            rx="1" ry="1"
            fill="#FFD54F" 
            className={`${styles.leg} ${styles.leftLeg} ${isMoving ? styles[`step${animationStep}`] : ''}`}
          />
          <rect 
            x="12.5" y="19" 
            width="2" height="4" 
            rx="1" ry="1"
            fill="#FFD54F" 
            className={`${styles.leg} ${styles.rightLeg} ${isMoving ? styles[`step${animationStep}`] : ''}`}
          />
          
          {/* Značka lokace pod postavičkou */}
          <path 
            d="M12 24c3-3 8-5 8-10 0-4.418-3.582-8-8-8s-8 3.582-8 8c0 5 5 7 8 10z" 
            fill="rgba(33, 150, 243, 0.4)" 
            stroke="#2196F3" 
            strokeWidth="0.7"
            className={styles.locationMarker}
          />
        </svg>
      </div>
      
      {/* Pulzující kruh pro zdůraznění pozice */}
      {pulse && <div className={styles.pulseCircle}></div>}
    </div>
  );
};

export default ExplorerMarker;
