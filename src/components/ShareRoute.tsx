import React, { useState } from 'react';
import styles from '../styles/ShareRoute.module.css';
import { Route } from '../types/social';

interface ShareRouteProps {
  route: Route;
  onClose: () => void;
}

interface SocialNetwork {
  id: string;
  name: string;
  icon: string;
  shareUrl: (title: string, text: string, url: string) => string;
}

const socialNetworks: SocialNetwork[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    shareUrl: (title, text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    shareUrl: (title, text, url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '📱',
    shareUrl: (title, text, url) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`
  },
  {
    id: 'email',
    name: 'Email',
    icon: '📧',
    shareUrl: (title, text, url) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`
  }
];

const ShareRoute: React.FC<ShareRouteProps> = ({ route, onClose }) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('gpx');
  
  // V reálné aplikaci by byl shareUrl získán z API, zde jen simulujeme
  React.useEffect(() => {
    // Simulace vygenerování URL pro sdílení
    setShareUrl(`https://randomapp.example.com/shared-routes/${route.id}?format=${selectedFormat}`);
  }, [route.id, selectedFormat]);
  
  // Formátování vzdálenosti
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };
  
  // Formátování času trvání
  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} h ${minutes % 60} min`;
    }
    
    return `${minutes} min ${seconds % 60} s`;
  };
  
  // Kopírování URL do schránky
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Sdílení na sociální síti
  const shareToSocialNetwork = (network: SocialNetwork) => {
    const title = `Podívejte se na moji trasu "${route.name}" v RandomAPP!`;
    const text = `Prozkoumal jsem trasu dlouhou ${formatDistance(route.totalDistance)} za ${formatDuration(route.duration)}.`;
    
    const url = network.shareUrl(title, text, shareUrl);
    window.open(url, '_blank');
  };
  
  return (
    <div className={styles.shareRouteContainer}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Sdílet trasu</h2>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      
      <div className={styles.modalBody}>
        <div className={styles.routeSummary}>
          <h3 className={styles.routeName}>{route.name}</h3>
          <div className={styles.routeStats}>
            <div className={styles.routeStat}>
              <span className={styles.routeStatIcon}>🛣️</span>
              <span className={styles.routeStatValue}>{formatDistance(route.totalDistance)}</span>
            </div>
            <div className={styles.routeStat}>
              <span className={styles.routeStatIcon}>⏱️</span>
              <span className={styles.routeStatValue}>{formatDuration(route.duration)}</span>
            </div>
            <div className={styles.routeStat}>
              <span className={styles.routeStatIcon}>📍</span>
              <span className={styles.routeStatValue}>{route.points.length} bodů</span>
            </div>
          </div>
        </div>
        
        <div className={styles.formatSelection}>
          <h4>Formát exportu:</h4>
          <div className={styles.formatOptions}>
            <button 
              className={`${styles.formatButton} ${selectedFormat === 'gpx' ? styles.selectedFormat : ''}`}
              onClick={() => setSelectedFormat('gpx')}
            >
              GPX
            </button>
            <button 
              className={`${styles.formatButton} ${selectedFormat === 'kml' ? styles.selectedFormat : ''}`}
              onClick={() => setSelectedFormat('kml')}
            >
              KML
            </button>
            <button 
              className={`${styles.formatButton} ${selectedFormat === 'geojson' ? styles.selectedFormat : ''}`}
              onClick={() => setSelectedFormat('geojson')}
            >
              GeoJSON
            </button>
          </div>
        </div>
        
        <div className={styles.shareUrlContainer}>
          <div className={styles.shareUrl}>{shareUrl}</div>
          <button 
            className={styles.copyButton}
            onClick={copyToClipboard}
            disabled={copied}
          >
            {copied ? 'Zkopírováno!' : 'Kopírovat'}
          </button>
        </div>
        
        <div className={styles.socialNetworks}>
          <h4>Sdílet na:</h4>
          <div className={styles.socialButtons}>
            {socialNetworks.map(network => (
              <button
                key={network.id}
                className={styles.socialNetworkButton}
                onClick={() => shareToSocialNetwork(network)}
                title={`Sdílet na ${network.name}`}
              >
                <span className={styles.socialIcon}>{network.icon}</span>
                <span className={styles.socialName}>{network.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className={styles.qrCodeContainer}>
          <h4>QR kód pro sdílení:</h4>
          <div className={styles.qrCode}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`} 
              alt="QR kód pro sdílení trasy" 
              width={150}
              height={150}
            />
          </div>
          <button className={styles.downloadQrButton}>Stáhnout QR kód</button>
        </div>
      </div>
    </div>
  );
};

export default ShareRoute;
