import React, { useState } from 'react';
import Image from 'next/image';
import QRScanner from './QRScanner';
import styles from '../styles/ScannerButton.module.css';

interface ScannerButtonProps {
  onScan: (data: string) => void;
}

const ScannerButton: React.FC<ScannerButtonProps> = ({ onScan }) => {
  const [showScanner, setShowScanner] = useState(false);

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  const handleScan = (data: string) => {
    onScan(data);
    setShowScanner(false);
  };

  return (
    <>
      <button
        className={styles.scannerButton}
        onClick={handleOpenScanner}
        aria-label="Skenovat QR kód"
      >
        <div className={styles.iconWrapper}>
          <Image
            src="/assets/icons/qr-code-scan.svg"
            alt="QR kód"
            width={24}
            height={24}
          />
        </div>
        <span>Skenovat</span>
      </button>

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={handleCloseScanner} />
      )}
    </>
  );
};

export default ScannerButton;
