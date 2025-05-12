import React, { useState } from 'react';
import useOrientation from '../hooks/useOrientation';

interface ResponsiveDebuggerProps {
  children?: React.ReactNode;
}

/**
 * Komponenta pro debugování responzivního designu
 * Zobrazuje overlay s informacemi o aktuální velikosti obrazovky a orientaci
 * Umožňuje interaktivně testovat responzivní design
 */
const ResponsiveDebugger: React.FC<ResponsiveDebuggerProps> = ({ children }) => {
  const { isLandscape, orientation, windowWidth, windowHeight } = useOrientation();
  const [showGrid, setShowGrid] = useState(false);
  const [showDeviceFrame, setShowDeviceFrame] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [activeDevice, setActiveDevice] = useState<string | null>(null);
  
  // Běžné velikosti zařízení pro simulaci
  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'Samsung S21', width: 360, height: 800 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
  ];
  
  // CSS styly pro debugger
  const debuggerStyles: React.CSSProperties = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    zIndex: 10000,
    fontFamily: 'sans-serif',
    maxWidth: '250px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(8px)'
  };
  
  // Styly pro tlačítka
  const buttonStyle: React.CSSProperties = {
    background: '#2196F3',
    border: 'none',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '4px',
    margin: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  };
  
  // Styl pro aktivní tlačítko
  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#4CAF50'
  };
  
  // Styl pro rozbalovací seznam zařízení
  const deviceSelectStyle: React.CSSProperties = {
    background: '#333',
    color: 'white',
    border: '1px solid #555',
    borderRadius: '4px',
    padding: '5px',
    margin: '5px 0',
    width: '100%'
  };
  
  // CSS Grid overlay
  const gridOverlay = showGrid && (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9997,
      pointerEvents: 'none',
      backgroundImage: `
        linear-gradient(to right, rgba(255,0,0,0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,0,0,0.1) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0',
      backgroundRepeat: 'repeat'
    }} />
  );
  
  // Zobrazení aktuálních breakpointů
  const breakpointIndicator = showDetails && (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9998
    }}>
      <div>
        <strong>Rozměry:</strong> {windowWidth} × {windowHeight}
      </div>
      <div>
        <strong>Orientace:</strong> {orientation}
      </div>
      <div>
        <strong>CSS Breakpoint:</strong> {' '}
        {windowWidth < 480 && 'Extra malý'}
        {windowWidth >= 480 && windowWidth < 768 && 'Malý'}
        {windowWidth >= 768 && windowWidth < 992 && 'Střední'}
        {windowWidth >= 992 && windowWidth < 1200 && 'Velký'}
        {windowWidth >= 1200 && 'Extra velký'}
      </div>
    </div>
  );
  
  // Frame pro zobrazení simulace zařízení
  const deviceFrame = showDeviceFrame && activeDevice && (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      border: '15px solid #333',
      borderRadius: '20px',
      boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
      zIndex: 9996
    }}>
      <div style={{
        fontSize: '12px',
        padding: '2px 10px',
        background: '#333',
        color: 'white',
        textAlign: 'center'
      }}>
        {activeDevice} - {devices.find(d => d.name === activeDevice)?.width} × {devices.find(d => d.name === activeDevice)?.height}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      {children}
      
      {gridOverlay}
      {breakpointIndicator}
      {deviceFrame}
      
      <div style={debuggerStyles}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>
          Responzivní Debugger
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div style={{ marginBottom: '5px' }}>Nástroje:</div>
          <button 
            style={showGrid ? activeButtonStyle : buttonStyle}
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? 'Skrýt mřížku' : 'Zobrazit mřížku'}
          </button>
          
          <button 
            style={showDetails ? activeButtonStyle : buttonStyle}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Skrýt detaily' : 'Zobrazit detaily'}
          </button>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div style={{ marginBottom: '5px' }}>Simulace zařízení:</div>
          <select 
            style={deviceSelectStyle}
            value={activeDevice || ''}
            onChange={(e) => {
              setActiveDevice(e.target.value);
              setShowDeviceFrame(!!e.target.value);
            }}
          >
            <option value="">-- Vyberte zařízení --</option>
            {devices.map(device => (
              <option key={device.name} value={device.name}>
                {device.name} ({device.width}×{device.height})
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div style={{ marginBottom: '5px' }}>Rámec zařízení:</div>
          <button 
            style={showDeviceFrame ? activeButtonStyle : buttonStyle}
            onClick={() => setShowDeviceFrame(!showDeviceFrame)}
            disabled={!activeDevice}
          >
            {showDeviceFrame ? 'Skrýt' : 'Zobrazit'}
          </button>
        </div>
        
        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '15px', textAlign: 'center' }}>
          Použijte vývojářské nástroje prohlížeče pro pokročilé testování responzivity
        </div>
      </div>
    </div>
  );
};

export default ResponsiveDebugger;
