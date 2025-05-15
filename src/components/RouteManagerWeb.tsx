import React, { useState } from 'react';
import styles from '../styles/Social.module.css';
import { useSocialStore } from '../store/socialStoreEnhanced';
import { Route } from '../types/social';
import { formatDistance, formatDuration } from '../utils/formatters';
import { downloadRouteAsGpx, downloadRouteAsKml } from '../utils/routeExport';

type RouteManagerProps = {
  onClose: () => void;
  onViewRoute?: (route: Route) => void;
  onShare?: (route: Route) => void;
};

const RouteManager: React.FC<RouteManagerProps> = ({ onClose, onViewRoute, onShare }) => {
  const { 
    savedRoutes, 
    isRecordingRoute, 
    startRouteRecording, 
    stopRouteRecording, 
    deleteRoute, 
    shareRoute, 
    importRoute 
  } = useSocialStore();
  
  const [showNewRouteModal, setShowNewRouteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedRouteForExport, setSelectedRouteForExport] = useState<Route | null>(null);
  const [newRouteName, setNewRouteName] = useState('');
  const [importCode, setImportCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recorded' | 'shared'>('all');
  
  const handleStartRecording = () => {
    if (newRouteName.trim()) {
      startRouteRecording(newRouteName);
      setNewRouteName('');
      setShowNewRouteModal(false);
      alert("Záznam vaší trasy byl zahájen. Můžete pokračovat v hraní a až budete hotovi, stačí záznam ukončit.");
    } else {
      alert("Zadejte název trasy");
    }
  };
  
  const handleStopRecording = () => {
    if (confirm("Opravdu chcete ukončit záznam aktuální trasy?")) {
      stopRouteRecording();
      alert("Záznam trasy byl ukončen a trasa byla uložena.");
    }
  };
    const handleShareRoute = (route: Route) => {
    // Pokud máme handler pro sdílení, použijeme novou komponentu ShareRoute
    if (typeof onShare === 'function') {
      onShare(route);
    } else {
      // Fallback pro starší způsob
      const routeCode = shareRoute(route);
      
      if (routeCode) {
        navigator.clipboard.writeText(routeCode);
        alert(`Kód trasy byl zkopírován do schránky: ${routeCode}`);
      } else {
        alert("Nepodařilo se vygenerovat kód pro sdílení trasy.");
      }
    }
  };
  
  const handleImportRoute = async () => {
    if (!importCode.trim()) {
      alert("Zadejte kód trasy");
      return;
    }
    
    setLoading(true);
    const success = await importRoute(importCode);
    setLoading(false);
    
    if (success) {
      setShowImportModal(false);
      setImportCode('');
      alert("Trasa byla úspěšně importována!");
    } else {
      alert("Import trasy se nezdařil. Zkontrolujte kód a zkuste to znovu.");
    }
  };
  
  const handleDeleteRoute = (route: Route) => {
    if (confirm(`Opravdu chcete smazat trasu "${route.name}"?`)) {
      deleteRoute(route.id);
    }
  };
  
  const handleExportRoute = (route: Route) => {
    setSelectedRouteForExport(route);
    setShowExportModal(true);
  };
  
  const handleExportAs = (format: 'gpx' | 'kml') => {
    if (!selectedRouteForExport) return;
    
    if (format === 'gpx') {
      downloadRouteAsGpx(selectedRouteForExport);
    } else if (format === 'kml') {
      downloadRouteAsKml(selectedRouteForExport);
    }
    
    setShowExportModal(false);
  };
  
  const filteredRoutes = savedRoutes.filter(route => {
    if (activeTab === 'all') return true;
    if (activeTab === 'recorded') return !route.isImported;
    if (activeTab === 'shared') return route.isImported;
    return true;
  });

  return (
    <div className={`${styles.socialModal} social-modal`}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Správa tras</h2>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
      </div>
      
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Všechny trasy
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'recorded' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('recorded')}
        >
          Moje záznamy
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'shared' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          Importované
        </button>
      </div>
      
      <div className={styles.modalBody}>
        {isRecordingRoute ? (
          <div className={styles.recordingNotice}>
            <p><span className={styles.recordingIndicator}>●</span> Záznam trasy aktivní</p>
            <button 
              className={styles.primaryButton}
              onClick={handleStopRecording}
            >
              Ukončit záznam trasy
            </button>
          </div>
        ) : (
          <div className={styles.routeActions}>
            <button 
              className={`${styles.primaryButton} button-hover`}
              onClick={() => setShowNewRouteModal(true)}
            >
              Zaznamenat novou trasu
            </button>
            <button 
              className={`${styles.secondaryButton} button-hover`}
              onClick={() => setShowImportModal(true)}
            >
              Importovat trasu
            </button>
          </div>
        )}
        
        <div className={styles.routesList}>
          <h3>Trasy ({filteredRoutes.length})</h3>
          
          {filteredRoutes.length === 0 ? (
            <div className={styles.emptyState}>
              {activeTab === 'all' && <p>Zatím nemáte žádné trasy</p>}
              {activeTab === 'recorded' && <p>Zatím jste nezaznamenali žádné trasy</p>}
              {activeTab === 'shared' && <p>Zatím jste neimportovali žádné trasy</p>}
            </div>
          ) : (
            filteredRoutes.map(route => (
              <div key={route.id} className={`${styles.routeCard} ${route.isNew ? 'new-item-highlight' : ''}`}>
                <div className={styles.routeHeader}>
                  <h4 className={styles.routeName}>{route.name}</h4>
                  {route.isImported && <span className={styles.importedLabel}>Importováno</span>}
                </div>
                <p className={styles.routeStats}>
                  Vzdálenost: {formatDistance(route.totalDistance)} • 
                  Trvání: {formatDuration(route.duration)} • 
                  Body: {route.points.length}
                </p>
                <div className={styles.routeActions}>
                  <button 
                    className={`${styles.actionButton} ${styles.viewButton}`}
                    onClick={() => onViewRoute && onViewRoute(route)}
                    title="Zobrazit na mapě"
                  >
                    <span role="img" aria-label="Zobrazit">🗺️</span>
                  </button>
                  <button 
                    className={`${styles.actionButton} ${styles.exportButton}`}
                    onClick={() => handleExportRoute(route)}
                    title="Exportovat"
                  >
                    <span role="img" aria-label="Export">⬇️</span>
                  </button>
                  <button 
                    className={`${styles.actionButton} ${styles.shareButton}`}
                    onClick={() => handleShareRoute(route)}
                    title="Sdílet"
                  >
                    <span role="img" aria-label="Sdílet">📤</span>
                  </button>
                  <button 
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteRoute(route)}
                    title="Smazat"
                  >
                    <span role="img" aria-label="Smazat">🗑️</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Modální okno pro vytvoření nové trasy */}
      {showNewRouteModal && (
        <div className={styles.innerModal}>
          <div className={styles.innerModalContent}>
            <h3>Nová trasa</h3>
            <p>Zadejte název pro vaši novou trasu:</p>
            <input
              type="text"
              placeholder="Název trasy"
              value={newRouteName}
              onChange={(e) => setNewRouteName(e.target.value)}
              className={styles.textInput}
            />
            <div className={styles.buttonGroup}>
              <button 
                className={styles.secondaryButton}
                onClick={() => setShowNewRouteModal(false)}
              >
                Zrušit
              </button>
              <button 
                className={styles.primaryButton}
                onClick={handleStartRecording}
              >
                Začít záznam
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modální okno pro import trasy */}
      {showImportModal && (
        <div className={styles.innerModal}>
          <div className={styles.innerModalContent}>
            <h3>Import trasy</h3>
            <p>Zadejte kód sdílené trasy:</p>
            <input
              type="text"
              placeholder="Kód trasy"
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              className={styles.textInput}
            />
            <div className={styles.buttonGroup}>
              <button 
                className={styles.secondaryButton}
                onClick={() => setShowImportModal(false)}
                disabled={loading}
              >
                Zrušit
              </button>
              <button 
                className={styles.primaryButton}
                onClick={handleImportRoute}
                disabled={loading}
              >
                {loading ? 'Importuji...' : 'Importovat'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modální okno pro export trasy */}
      {showExportModal && selectedRouteForExport && (
        <div className={styles.innerModal}>
          <div className={styles.innerModalContent}>
            <h3>Export trasy</h3>
            <p>Vyberte formát exportu pro trasu "{selectedRouteForExport.name}":</p>
            <div className={styles.exportOptions}>
              <button 
                className={`${styles.exportOption} button-hover`}
                onClick={() => handleExportAs('gpx')}
              >
                <div className={styles.exportIcon}>GPX</div>
                <div className={styles.exportDescription}>
                  <strong>GPX formát</strong>
                  <span>Kompatibilní s většinou GPS zařízení a aplikacemi</span>
                </div>
              </button>
              
              <button 
                className={`${styles.exportOption} button-hover`}
                onClick={() => handleExportAs('kml')}
              >
                <div className={styles.exportIcon}>KML</div>
                <div className={styles.exportDescription}>
                  <strong>KML formát</strong>
                  <span>Pro Google Earth a další mapové služby</span>
                </div>
              </button>
            </div>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.secondaryButton}
                onClick={() => setShowExportModal(false)}
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className={styles.modalFooter}>
        <button className={styles.secondaryButton} onClick={onClose}>
          Zavřít
        </button>
      </div>
    </div>
  );
};

export default RouteManager;
