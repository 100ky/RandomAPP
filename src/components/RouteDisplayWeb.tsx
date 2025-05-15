import React, { useState, useEffect } from 'react';
import styles from '../styles/RouteDisplay.module.css';
import { Route } from '../types/social';
import { formatDistance, formatDuration } from '../utils/formatters';

interface RouteDisplayProps {
  route: Route;
  isActive?: boolean;
  onClose?: () => void;
}

const RouteDisplay: React.FC<RouteDisplayProps> = ({ 
  route, 
  isActive = false, 
  onClose 
}) => {
  const [routeElement, setRouteElement] = useState<SVGPathElement | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  useEffect(() => {
    if (routeElement && isActive) {
      // Animace cesty
      const length = routeElement.getTotalLength();
      routeElement.style.strokeDasharray = `${length} ${length}`;
      routeElement.style.strokeDashoffset = `${length}`;
      
      let start: number | null = null;
      const duration = 1500; // 1.5s animace
      
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setAnimationProgress(progress);
        routeElement.style.strokeDashoffset = `${length * (1 - progress)}`;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [routeElement, isActive]);
  
  if (!route || route.points.length === 0) return null;

  const startPoint = route.points[0];
  const endPoint = route.points[route.points.length - 1];
  
  // Najít hranice trasy pro SVG viewBox
  const minLat = Math.min(...route.points.map(p => p.lat));
  const maxLat = Math.max(...route.points.map(p => p.lat));
  const minLng = Math.min(...route.points.map(p => p.lng));
  const maxLng = Math.max(...route.points.map(p => p.lng));
  
  // Přidat 10% padding kolem trasy
  const latPadding = (maxLat - minLat) * 0.1;
  const lngPadding = (maxLng - minLng) * 0.1;
  
  // Vytvořit SVG path commends z bodů trasy
  const pathCommands = route.points.map((point, index) => {
    // Normalizace bodů na SVG prostor
    const x = ((point.lng - minLng) / (maxLng - minLng + 2 * lngPadding)) * 100;
    const y = (1 - (point.lat - minLat) / (maxLat - minLat + 2 * latPadding)) * 100;
    
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Formátovat údaje o trase
  const formattedDistance = formatDistance(route.totalDistance);
  const formattedDuration = formatDuration(route.duration);

  return (
    <div className={`${styles.routeContainer} ${isActive ? styles.activeRoute : ''}`}>
      {isActive && (
        <div className={styles.routeOverview}>
          <div className={styles.routeInfo}>
            <h3 className={styles.routeName}>{route.name}</h3>
            <div className={styles.routeStats}>
              <div className={styles.statItem}>
                <span className={styles.statIcon}>📏</span>
                <span className={styles.statValue}>{formattedDistance}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIcon}>⏱️</span>
                <span className={styles.statValue}>{formattedDuration}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIcon}>📍</span>
                <span className={styles.statValue}>{route.points.length} bodů</span>
              </div>
            </div>
            {route.isImported && (
              <div className={styles.importedBadge}>Importovaná trasa</div>
            )}
          </div>
          {onClose && (
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Zavřít zobrazení trasy"
            >
              ✕
            </button>
          )}
        </div>
      )}
      
      <div className={styles.routeVisualization}>
        <svg 
          className={styles.routeSvg} 
          viewBox={`${-lngPadding} ${-latPadding} ${maxLng - minLng + 2 * lngPadding} ${maxLat - minLat + 2 * latPadding}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            ref={setRouteElement}
            d={pathCommands}
            className={`${styles.routePath} ${isActive ? styles.activePath : ''}`}
          />
          
          {/* Počáteční bod */}
          <circle 
            cx={(startPoint.lng - minLng) / (maxLng - minLng)} 
            cy={1 - (startPoint.lat - minLat) / (maxLat - minLat)}
            r="5"
            className={`${styles.startPoint} ${animationProgress > 0 ? styles.visible : ''}`}
          />
          
          {/* Koncový bod */}
          <circle 
            cx={(endPoint.lng - minLng) / (maxLng - minLng)} 
            cy={1 - (endPoint.lat - minLat) / (maxLat - minLat)}
            r="5"
            className={`${styles.endPoint} ${animationProgress > 0.9 ? styles.visible : ''}`}
          />
        </svg>
      </div>
    </div>
  );
};

export default RouteDisplay;
