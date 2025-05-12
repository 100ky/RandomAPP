import React from 'react';
import useOrientation from '../hooks/useOrientation';

interface ResponsiveTesterProps {
  showDetails?: boolean;
}

/**
 * Komponenta pro testování responzivního designu
 * Zobrazuje aktuální rozměry obrazovky, orientaci a další užitečné informace
 */
const ResponsiveTester: React.FC<ResponsiveTesterProps> = ({ showDetails = true }) => {
  const { isLandscape, orientation, windowWidth, windowHeight } = useOrientation();
  
  const isSmallScreen = windowWidth < 480 || windowHeight < 480;
  const isMediumScreen = windowWidth >= 480 && windowWidth < 768;
  const isLargeScreen = windowWidth >= 768;
  
  const styles: React.CSSProperties = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    zIndex: 9999,
    fontFamily: 'monospace',
    maxWidth: '300px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(4px)',
    transition: 'all 0.3s ease'
  };
  
  if (!showDetails) {
    return (
      <div style={styles}>
        {windowWidth} × {windowHeight} ({orientation})
      </div>
    );
  }

  return (
    <div style={styles}>
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        Responzivní tester
      </div>
      <div>
        <span style={{ fontWeight: 'bold' }}>Rozměry:</span> {windowWidth} × {windowHeight}
      </div>
      <div>
        <span style={{ fontWeight: 'bold' }}>Orientace:</span> {orientation}
      </div>
      <div>
        <span style={{ fontWeight: 'bold' }}>Velikost:</span> {' '}
        {isSmallScreen ? 'Malá (<480px)' : 
          isMediumScreen ? 'Střední (480-768px)' : 
          'Velká (>768px)'}
      </div>
      <div style={{ marginTop: '5px', fontSize: '10px' }}>
        <span style={{ 
          display: 'inline-block',
          padding: '2px 6px', 
          borderRadius: '3px', 
          background: isLandscape ? '#4CAF50' : '#2196F3',
          color: 'white',
          marginRight: '5px'
        }}>
          {isLandscape ? 'LANDSCAPE' : 'PORTRAIT'}
        </span>
        <span style={{ 
          display: 'inline-block',
          padding: '2px 6px', 
          borderRadius: '3px', 
          background: isSmallScreen ? '#FF5722' : 
            isMediumScreen ? '#FF9800' : '#8BC34A',
          color: 'white'
        }}>
          {isSmallScreen ? 'SMALL' : 
            isMediumScreen ? 'MEDIUM' : 'LARGE'}
        </span>
      </div>
      <div style={{ marginTop: '5px', fontSize: '11px', opacity: 0.8 }}>
        Přidat do komponenty pro testování
      </div>
    </div>
  );
};

export default ResponsiveTester;
