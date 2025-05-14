import React, { useState } from 'react';
import ResponsiveDebugger from '../components/ResponsiveDebugger';
import ResponsiveTester from '../components/ResponsiveTester';
import LoadingScreen from '../components/LoadingScreen';
import SplashScreen from '../components/SplashScreen';
import useOrientation from '../hooks/useOrientation';
import styles from '../styles/ResponsiveTest.module.css';

/**
 * Testovací stránka pro responzivní design
 * Umožňuje přepínat mezi různými komponentami a testovat jejich vzhled
 */
const ResponsiveTestPage: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string>('loading');
  const [showDebugger, setShowDebugger] = useState<boolean>(true);
  const [forceLandscape, setForceLandscape] = useState<boolean>(false);
  const [forcePortrait, setForcePortrait] = useState<boolean>(false);
  const [simulateAndroid, setSimulateAndroid] = useState<boolean>(false);
  
  const { isLandscape, orientation, windowWidth, windowHeight } = useOrientation();
  
  // Simulace orientace pomocí CSS tříd - použití lokálních tříd
  const handleForceLandscape = () => {
    if (forceLandscape) {
      document.documentElement.classList.remove('force-landscape-orientation');
      setForceLandscape(false);
    } else {
      document.documentElement.classList.add('force-landscape-orientation');
      document.documentElement.classList.remove('force-portrait-orientation');
      setForceLandscape(true);
      setForcePortrait(false);
    }
  };
  
  const handleForcePortrait = () => {
    if (forcePortrait) {
      document.documentElement.classList.remove('force-portrait-orientation');
      setForcePortrait(false);
    } else {
      document.documentElement.classList.add('force-portrait-orientation');
      document.documentElement.classList.remove('force-landscape-orientation');
      setForcePortrait(true);
      setForceLandscape(false);
    }
  };
  
  const handleSimulateAndroid = () => {
    if (simulateAndroid) {
      document.documentElement.classList.remove('android-device');
      setSimulateAndroid(false);
    } else {
      document.documentElement.classList.add('android-device');
      setSimulateAndroid(true);
    }
  };
  
  const handleComponentSwitch = (component: string) => {
    setSelectedComponent(component);
  };
  
  // Informace o aktuálním nastavení testu
  const statusText = `
    Skutečná orientace: ${orientation} (${windowWidth}x${windowHeight})
    ${forceLandscape ? '| Vynucen landscape režim' : ''}
    ${forcePortrait ? '| Vynucen portrait režim' : ''}
    ${simulateAndroid ? '| Simulace Android zařízení' : ''}
  `;
  
  return (
    <div className={styles.testContainer}>
      <h1>Test responzivního designu</h1>
      
      <div className={styles.testInfo}>
        <strong>Status:</strong> 
        <pre className={styles.statusText}>{statusText}</pre>
      </div>
      
      <div className={styles.controlsContainer}>
        <div className={styles.controlsRow}>
          <button 
            className={selectedComponent === 'loading' ? styles.activeButton : styles.inactiveButton} 
            onClick={() => handleComponentSwitch('loading')}
          >
            Loading Screen
          </button>
          <button 
            className={selectedComponent === 'splash' ? styles.activeButton : styles.inactiveButton} 
            onClick={() => handleComponentSwitch('splash')}
          >
            Splash Screen
          </button>
          <button 
            className={selectedComponent === 'debugger' ? styles.activeButton : styles.inactiveButton} 
            onClick={() => handleComponentSwitch('debugger')}
          >
            Debugger
          </button>
          <button 
            className={selectedComponent === 'tester' ? styles.activeButton : styles.inactiveButton} 
            onClick={() => handleComponentSwitch('tester')}
          >
            Responsive Tester
          </button>
        </div>
        
        <div className={styles.controlsRow}>
          <button 
            className={styles.toggleButton}
            style={{backgroundColor: forceLandscape ? '#ff9800' : '#2196F3'}} 
            onClick={handleForceLandscape}
          >
            {forceLandscape ? 'Zrušit vynucený landscape' : 'Vynutit landscape'}
          </button>
          <button 
            className={styles.toggleButton}
            style={{backgroundColor: forcePortrait ? '#ff9800' : '#2196F3'}} 
            onClick={handleForcePortrait}
          >
            {forcePortrait ? 'Zrušit vynucený portrait' : 'Vynutit portrait'}
          </button>
          <button 
            className={styles.toggleButton}
            style={{backgroundColor: simulateAndroid ? '#ff9800' : '#2196F3'}} 
            onClick={handleSimulateAndroid}
          >
            {simulateAndroid ? 'Vypnout simulaci Android' : 'Simulovat Android'}
          </button>
        </div>
      </div>
      
      {/* Kontejner pro testované komponenty */}
      <div className={`
        ${styles.testViewport}
        ${forceLandscape ? styles.forceLandscape : ''}
        ${forcePortrait ? styles.forcePortrait : ''}
        ${simulateAndroid ? styles.simulateAndroid : ''}
      `}>        {selectedComponent === 'debugger' && <ResponsiveDebugger />}
        {selectedComponent === 'tester' && <ResponsiveTester showDetails={true} />}
        {selectedComponent === 'loading' && <LoadingScreen />}
        {selectedComponent === 'splash' && <SplashScreen onFinish={() => console.log('Splash finished')} selectedAvatarId="explorer" />}
      </div>
    </div>
  );
};

export default ResponsiveTestPage;
