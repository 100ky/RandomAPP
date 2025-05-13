import React, { useState, useEffect } from 'react';
import { avatars } from './AppMenu';
import styles from '../styles/StartMenu.module.cs  // Vrácení tematické zprávy podle vybraného avatara
  const getThemeMessage = () => {
    switch(selectedAvatarId) {
      case 'Bivoj':
        return "Síla a odvaha! Objevte tajemství královského města Vysoké Mýto!";
      case 'princezna':
        return "Vaše Výsosti, historické památky Vysokého Mýta čekají na Vaši pozornost!";
      case 'ninja':
        return "Tiše a bystře prozkoumejte každý kout královského města Vysoké Mýto.";
      case 'detective':
        return "Odhalte skrytá tajemství historických památek Vysokého Mýta!";
      case 'explorer':
        return "Prozkoumejte královské město Vysoké Mýto a jeho dávnou historii!";
      default:
        return "Vyberte si avatara pro zahájení průzkumu Vysokého Mýta!";
    }
  };artMenuProps {
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
  const containerClassName = `${styles.startContainer} ${styles[colorScheme.decorationClass.replace('-theme', 'Theme')]}`;

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
    <div className={styles.startMenu}>
      <h1 className={styles.title}>Průzkumník Vysokého Mýta</h1>
      <div className={containerClassName}>
        <div className={styles.themeMessage}>{getThemeMessage()}</div>
        
        <div className={styles.missionDescription}>
          <h3>Vaše mise</h3>
          <p>Vydejte se na dobrodružnou cestu historickým královským městem Vysoké Mýto. Navštivte významné památky, řešte zajímavé hádanky a objevujte tajemství staletých staveb.</p>
          <p>Při průzkumu vás čeká 9 unikátních lokací s úkoly inspirovanými skutečnými historickými fakty. Použijte svůj důvtip, znalosti a pozorovací schopnosti!</p>
        </div>
        
        <div className={styles.playerInfoSection}>
          <div className={styles.playerNameInput}>
            <label htmlFor="player-name">Vaše jméno:</label>
            <input 
              type="text" 
              id="player-name" 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
              placeholder="Zadejte své jméno"
              style={{ borderColor: colorScheme.accent }}
            />
          </div>

          <div className={styles.avatarSelectionSection}>
            <h3>Vyberte si avatara:</h3>
            <div className={styles.avatarGrid}>
              {avatars.map((avatar) => (
                <div 
                  key={avatar.id}
                  className={`${styles.avatarOption} ${selectedAvatarId === avatar.id ? styles.selected : ''}`}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                >
                  <div className={styles.avatarWrapper}>
                    <img src={avatar.imageUrl} alt={avatar.name} />
                    {selectedAvatarId === avatar.id && <div className={styles.avatarDecoration}></div>}
                  </div>
                  <span>{avatar.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <button 
          className={styles.startGameButton}
          onClick={handleStartGame}
        >
          Vydat se na průzkum
        </button>
      </div>
    </div>
  );
};

export default StartMenu;