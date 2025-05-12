import React, { useState, useEffect } from 'react';
import styles from '../styles/LandscapeTest.module.css';
import { useEnhancedOrientation } from '../hooks/useEnhancedOrientation';
import Link from 'next/link';

/**
 * Testovací komponenta pro kontrolu správného zobrazení v landscape módu
 * Tato komponenta simuluje různé typy zařízení a jejich specifické zobrazení
 */
const LandscapeTest: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('normal');
  const orientation = useEnhancedOrientation();
  const { isLandscape, windowWidth, windowHeight, isAndroid, isIOS, 
    isSamsung, isOldDevice, isLowPerformance, devicePixelRatio } = orientation;
  // Simuluje různé typy zařízení
  const simulateDevice = (deviceType: string) => {
    // Reset všech simulačních tříd
    document.documentElement.classList.remove(
      'simulated-samsung',
      'simulated-old-device',
      'simulated-low-performance',
      'simulated-ios'
    );

    // Přidá specifickou třídu podle vybraného zařízení
    if (deviceType !== 'normal') {
      document.documentElement.classList.add(`simulated-${deviceType}`);
      
      // Přidá parametr do URL pro testování
      const url = new URL(window.location.href);
      url.searchParams.set('device', deviceType);
      window.history.replaceState({}, '', url.toString());
    } else {
      // Odstraní parametr z URL
      const url = new URL(window.location.href);
      url.searchParams.delete('device');
      window.history.replaceState({}, '', url.toString());
    }

    setActiveView(deviceType);
  };
  
  // Kontrola URL parametrů při načtení
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceParam = urlParams.get('device');
    if (deviceParam) {
      simulateDevice(deviceParam);
    }
  }, []);
  return (
    <div className={styles.testContainer}>
      <div className={styles.controls}>
        <h1>Test zobrazení v landscape módu</h1>
        
        <div className={styles.deviceInfo}>
          <h3>Detekované parametry zařízení:</h3>
          <p>Aktuální orientace: <strong>{isLandscape ? 'Na šířku' : 'Na výšku'}</strong></p>
          <p>Rozlišení: <strong>{windowWidth} × {windowHeight}</strong></p>
          <p>Poměr pixelů: <strong>{devicePixelRatio.toFixed(2)}</strong></p>
          <p>Typ zařízení: <strong>
            {isAndroid ? 'Android' : isIOS ? 'iOS' : 'Desktop/Jiné'}
            {isSamsung ? ' (Samsung)' : ''}
            {isOldDevice ? ' (Starší verze)' : ''}
          </strong></p>
          <p>Výkonnostní profil: <strong>{isLowPerformance ? 'Nízkovýkonné' : 'Standardní'}</strong></p>
        </div>
        
        <h3>Simulace zařízení:</h3>
        <div className={styles.buttonGroup}>
          <button 
            className={`${styles.button} ${activeView === 'normal' ? styles.active : ''}`}
            onClick={() => simulateDevice('normal')}
          >
            Normální zobrazení
          </button>
          
          <button 
            className={`${styles.button} ${activeView === 'samsung' ? styles.active : ''}`}
            onClick={() => simulateDevice('samsung')}
          >
            Samsung
          </button>
          
          <button 
            className={`${styles.button} ${activeView === 'old-device' ? styles.active : ''}`}
            onClick={() => simulateDevice('old-device')}
          >
            Starší Android
          </button>
          
          <button 
            className={`${styles.button} ${activeView === 'low-performance' ? styles.active : ''}`}
            onClick={() => simulateDevice('low-performance')}
          >
            Nízkovýkonné zařízení
          </button>
          
          <button 
            className={`${styles.button} ${activeView === 'ios' ? styles.active : ''}`}
            onClick={() => simulateDevice('ios')}
          >
            iOS zařízení
          </button>
        </div>
        
        <div className={styles.testLinks}>
          <h3>Testy obrazovek:</h3>
          <Link href={`/landscape-test/splash?device=${activeView !== 'normal' ? activeView : ''}`} className={styles.testLink}>
            Testovat SplashScreen
          </Link>
          <Link href={`/landscape-test/loading?device=${activeView !== 'normal' ? activeView : ''}`} className={styles.testLink}>
            Testovat LoadingScreen
          </Link>
        </div>
        
        <p className={styles.instruction}>
          Pro nejlepší test otočte zařízení do režimu na šířku nebo změňte velikost okna prohlížeče.
        </p>
      </div>
      
      <div className={styles.previewArea}>
        <div className={styles.mockScreen}>
          <div className={styles.deviceFrame}>
            <div className={styles.content}>
              <h2>Náhled obsahu</h2>
              <p>Tato oblast simuluje, jak by vypadal obsah na vybraném zařízení.</p>
              {activeView === 'samsung' && (
                <p className={styles.deviceSpecific}>
                  Samsung zařízení často potřebují speciální řešení výšky v landscape módu.
                </p>
              )}
              {activeView === 'old-device' && (
                <p className={styles.deviceSpecific}>
                  Starší Android zařízení mají zjednodušené animace pro lepší výkon.
                </p>
              )}
              {activeView === 'low-performance' && (
                <p className={styles.deviceSpecific}>
                  Na nízkovýkonných zařízeních jsou zakázány komplexní animace a efekty.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandscapeTest;
