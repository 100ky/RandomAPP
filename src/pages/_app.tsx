import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/globals.css';
// Globální CSS soubory pro responzivní design a optimalizace pro různá zařízení
import '../styles/OrientationFixes.css';
import '../styles/SmallScreenFixes.css';
import '../styles/AndroidFixes.css';
import '../styles/LoadingScreenUpdates.css';
import '../styles/ResponsiveFixes.css';
import '../styles/ResponsiveTestHelpers.css';
import '../styles/iOSFixes.css';
import '../styles/MobileUIFixes.css';
import '../styles/DeviceSpecificFixes.css';
import '../styles/DeviceSimulation.css';
import { applyDeviceOptimizations } from '../utils/deviceDetection';

function MyApp({ Component, pageProps }: AppProps) {
  // Aplikace optimalizací pro zařízení při načtení aplikace
  useEffect(() => {
    applyDeviceOptimizations();
    
    // Pro testování - vypisovat informace o zařízení do konzole v dev režimu
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      if (window.__deviceInfo) {
        // @ts-ignore
        console.log('Device Info:', window.__deviceInfo);
      }
    }
  }, []);
  
  return (
    <>      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="orientation" content="portrait-primary" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;