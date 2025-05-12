import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SplashScreen from '../../components/SplashScreen';
import Head from 'next/head';
import styles from '../../styles/TestPage.module.css';
import Link from 'next/link';
import { useEnhancedOrientation } from '../../hooks/useEnhancedOrientation';

/**
 * Testovací stránka pro SplashScreen v různých orientacích a zařízeních
 */
const SplashScreenTest: React.FC = () => {
  const [showScreen, setShowScreen] = useState(true);
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
  }, [device]);
  
  // Reset po dokončení SplashScreen
  const handleFinish = () => {
    setShowScreen(false);
    // Timeout pro znovuobjevení ovládacích prvků
    setTimeout(() => {
      document.querySelector<HTMLDivElement>(`.${styles.testControls}`)?.classList.add(styles.visible);
    }, 500);
  };
  
  // Restart SplashScreen pro opětovné testování
  const restartSplash = () => {
    document.querySelector<HTMLDivElement>(`.${styles.testControls}`)?.classList.remove(styles.visible);
    setShowScreen(true);
  };
  
  return (
    <>
      <Head>
        <title>Test SplashScreen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      {showScreen && <SplashScreen onFinish={handleFinish} />}
      
      <div className={`${styles.testControls} ${!showScreen ? styles.visible : ''}`}>
        <div className={styles.deviceInfo}>
          <p>Orientace: <strong>{isLandscape ? 'Na šířku' : 'Na výšku'}</strong></p>
          <p>Rozlišení: <strong>{windowWidth}×{windowHeight}</strong> ({devicePixelRatio.toFixed(1)}x)</p>
          {device && <p>Simulace: <strong>{device}</strong></p>}
        </div>
        
        <div className={styles.buttonContainer}>
          <button onClick={restartSplash} className={styles.restartButton}>
            Restartovat SplashScreen
          </button>
          
          <Link href="/landscape-test" className={styles.backButton}>
            Zpět na testovací přehled
          </Link>
        </div>
      </div>
    </>
  );
};

export default SplashScreenTest;
