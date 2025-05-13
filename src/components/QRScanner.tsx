import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import styles from '../styles/QRScanner.module.css';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannerMessage, setScannerMessage] = useState('Inicializace skeneru...');
  
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    
    const startScanner = async () => {
      try {
        // Vytvořit instanci skeneru
        html5QrCode = new Html5Qrcode('reader');
        
        setScannerMessage('Povolte přístup ke kameře...');
        
        await html5QrCode.start(
          { facingMode: 'environment' }, // zadní kamera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // Úspěšné skenování
            console.log(`Kód naskenován: ${decodedText}`);
            // Přehrajeme zvuk úspěchu
            const successSound = new Audio('/assets/sounds/discover-sound.mp3');
            successSound.play();
            
            // Zpracování naskenovaného QR kódu
            onScan(decodedText);
            html5QrCode?.stop();
            setIsScanning(false);
          },
          (errorMessage) => {
            // Tiché ignorování chyb během skenování
            // (Chyby se přirozeně vyskytují, když není QR kód v záběru)
          }
        );
        
        setIsScanning(true);
        setScannerMessage('Nasměrujte kameru na QR kód...');
      } catch (err) {
        console.error('Chyba při inicializaci skeneru:', err);
        setScannerMessage('Nepodařilo se inicializovat skener. Zkuste to znovu.');
      }
    };
    
    startScanner();
    
    return () => {
      if (html5QrCode && isScanning) {
        html5QrCode.stop().catch(err => console.error('Chyba při zastavení skeneru:', err));
      }
    };
  }, [onScan]);
  
  return (
    <div className={styles.scannerContainer}>
      <div className={styles.scannerHeader}>
        <h3>Skenování QR kódu</h3>
        <button className={styles.closeButton} onClick={onClose}>Zavřít</button>
      </div>
      
      <div id="reader" className={styles.reader}></div>
      
      <div className={styles.scannerFooter}>
        <p>{scannerMessage}</p>
      </div>
    </div>
  );
};

export default QRScanner;
