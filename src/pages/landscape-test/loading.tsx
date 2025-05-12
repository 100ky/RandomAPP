import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingScreen from '../../components/LoadingScreen';
import Head from 'next/head';
import styles from '../../styles/TestPage.module.css';
import Link from 'next/link';
import { useEnhancedOrientation } from '../../hooks/useEnhancedOrientation';

/**
 * Testovací stránka pro LoadingScreen v různých orientacích a zařízeních
 */
const LoadingScreenTest: React.FC = () => {
  const router = useRouter();
  const { device } = router.query;
  const { isLandscape, windowWidth, windowHeight, devicePixelRatio } = useEnhancedOrientation();
  
  // Aplikace typu zařízení pro simulaci, pokud je zadáno
  useEffect(() => {
    if (device && typeof device === 'string') {
      // Reset všech simulačních tříd
      document.documentElement.classList.remove(
        'simulated-samsung',
        'simulated-old-device',
        'simulated-low-performance',
        'simulated-ios'
      );
      document.documentElement.classList.add(`simulated-${device}`);
    }
    
    // Zobrazíme ovládací prvky po krátké chvíli
    setTimeout(() => {
      document.querySelector<HTMLDivElement>(`.${styles.testControls}`)?.classList.add(styles.visible);
    }, 1500);
  }, [device]);
  
  return (
    <>
      <Head>
        <title>Test LoadingScreen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <LoadingScreen />
      
      <div className={styles.testControls}>
        <div className={styles.deviceInfo}>
          <p>Orientace: <strong>{isLandscape ? 'Na šířku' : 'Na výšku'}</strong></p>
          <p>Rozlišení: <strong>{windowWidth}×{windowHeight}</strong> ({devicePixelRatio.toFixed(1)}x)</p>
          {device && <p>Simulace: <strong>{device}</strong></p>}
        </div>
        
        <div className={styles.buttonContainer}>
          <button onClick={() => window.location.reload()} className={styles.restartButton}>
            Restartovat LoadingScreen
          </button>
          
          <Link href="/landscape-test" className={styles.backButton}>
            Zpět na testovací přehled
          </Link>
        </div>
      </div>
    </>
  );
};

export default LoadingScreenTest;
