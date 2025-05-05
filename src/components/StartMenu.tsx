import React, { useState, useEffect } from 'react';
import { avatars } from './AppMenu';

interface StartMenuProps {
  onStartGame: (avatarId: string, playerName: string) => void;
}

// Definice barevných schémat pro jednotlivé avatary
const avatarColorSchemes: Record<string, { 
  background: string, 
  accent: string,
  containerBackground: string,
  buttonColor: string,
  fontFamily: string,
  decorationClass: string
}> = {
  'explorer': { 
    background: 'linear-gradient(to bottom right, #43a047, #1b5e20)', 
    accent: '#4CAF50',
    containerBackground: 'rgba(255, 255, 255, 0.9)',
    buttonColor: '#fff',
    fontFamily: "'Roboto', sans-serif",
    decorationClass: 'explorer-theme'
  },
  'detective': { 
    background: 'linear-gradient(to bottom right, #1976d2, #0d47a1)', 
    accent: '#2196F3',
    containerBackground: 'rgba(255, 255, 255, 0.9)',
    buttonColor: '#fff',
    fontFamily: "'Roboto Slab', serif",
    decorationClass: 'detective-theme'
  },
  'Bivoj': { 
    background: 'linear-gradient(to bottom right, #8b4513, #5d2906)',
    accent: '#a0522d',
    containerBackground: 'rgba(250, 240, 230, 0.9)',
    buttonColor: '#fff',
    fontFamily: "'Almendra', serif",
    decorationClass: 'bivoj-theme'
  },
  'princezna': { 
    background: 'linear-gradient(to bottom right, #e91e63, #880e4f)',
    accent: '#ff4081',
    containerBackground: 'rgba(253, 242, 248, 0.9)',
    buttonColor: '#fff',
    fontFamily: "'Dancing Script', cursive",
    decorationClass: 'princezna-theme'
  },
  'ninja': { 
    background: 'linear-gradient(to bottom right, #37474f, #102027)',
    accent: '#546e7a',
    containerBackground: 'rgba(30, 30, 30, 0.85)',
    buttonColor: '#fff',
    fontFamily: "'Noto Sans JP', sans-serif",
    decorationClass: 'ninja-theme'
  },
  'default': { 
    background: 'linear-gradient(to bottom right, #303f9f, #1a237e)', 
    accent: '#3f51b5',
    containerBackground: 'rgba(255, 255, 255, 0.9)',
    buttonColor: '#fff',
    fontFamily: "'Roboto', sans-serif",
    decorationClass: ''
  }
};

const StartMenu: React.FC<StartMenuProps> = ({ onStartGame }) => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>('explorer');
  const [hoveredAvatarId, setHoveredAvatarId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Načtení uložených preferencí
  useEffect(() => {
    const savedAvatarId = localStorage.getItem('userAvatarId');
    const savedPlayerName = localStorage.getItem('playerName');
    
    if (savedAvatarId) {
      setSelectedAvatarId(savedAvatarId);
    }
    
    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
    }
  }, []);

  const handleStartGame = () => {
    if (!playerName.trim()) {
      setError('Prosím zadejte své jméno');
      return;
    }

    if (!selectedAvatarId) {
      setError('Vyberte si avatara');
      return;
    }

    // Uložit preference
    localStorage.setItem('userAvatarId', selectedAvatarId);
    localStorage.setItem('playerName', playerName);
    
    // Spustit hru
    onStartGame(selectedAvatarId, playerName);
  };

  // Získat aktuální barevné schéma
  const getActiveColorScheme = () => {
    // Prioritizujeme vybraného avatara nad najetým
    return avatarColorSchemes[selectedAvatarId || 'default'] || avatarColorSchemes.default;
  };

  const colorScheme = getActiveColorScheme();

  // Dynamické styly podle vybraného avatara
  const dynamicStyles = {
    startMenu: {
      backgroundImage: colorScheme.background,
    },
    startContainer: {
      backgroundColor: colorScheme.containerBackground,
      fontFamily: colorScheme.fontFamily,
    },
    startButton: {
      backgroundColor: colorScheme.accent,
      color: colorScheme.buttonColor,
    },
    title: {
      fontFamily: colorScheme.fontFamily
    },
    inputBorder: {
      borderColor: colorScheme.accent
    }
  };

  // Vytvoříme třídy podle vybraného avatara
  const containerClassName = `start-container ${colorScheme.decorationClass}`;

  // Vrácení tematické zprávy podle vybraného avatara
  const getThemeMessage = () => {
    switch(selectedAvatarId) {
      case 'Bivoj':
        return "Síla a odvaha! Připraven přemoci kance?";
      case 'princezna':
        return "Vaše Výsosti, kouzelné dobrodružství čeká!";
      case 'ninja':
        return "Tiše a rychle, stíny jsou tvým spojencem.";
      case 'detective':
        return "Každá hádanka je výzvou pro tvůj bystrý intelekt.";
      case 'explorer':
        return "Neprozkoumaná území čekají na své objevitele!";
      default:
        return "Vítejte v únikové hře!";
    }
  };

  return (
    <div className="start-menu" style={dynamicStyles.startMenu}>
      <h1 style={dynamicStyles.title}>Úniková hra Vysoké Mýto</h1>
      <div className={containerClassName} style={dynamicStyles.startContainer}>
        <div className="theme-message">{getThemeMessage()}</div>
        
        <div className="player-info-section">
          <div className="player-name-input">
            <label htmlFor="player-name">Vaše jméno:</label>
            <input 
              type="text" 
              id="player-name" 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
              placeholder="Zadejte své jméno"
              className={colorScheme.decorationClass}
              style={{ borderColor: colorScheme.accent }}
            />
          </div>

          <div className="avatar-selection-section">
            <h3>Vyberte si avatara:</h3>
            <div className="avatar-grid">
              {avatars.map((avatar) => (
                <div 
                  key={avatar.id}
                  className={`avatar-option ${selectedAvatarId === avatar.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                >
                  <div className="avatar-wrapper">
                    <img src={avatar.imageUrl} alt={avatar.name} />
                    {selectedAvatarId === avatar.id && <div className="avatar-decoration"></div>}
                  </div>
                  <span>{avatar.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          className="start-game-button"
          style={dynamicStyles.startButton}
          onClick={handleStartGame}
        >
          Začít dobrodružství
        </button>
      </div>
    </div>
  );
};

export default StartMenu;