/**
 * Komponenta AppMenu - Zobrazuje hlavní menu aplikace s vybraným avatarem hráče
 * 
 * Tato komponenta slouží k zobrazení aktuálně vybraného avatara hráče v horní části aplikace.
 * Uživatel tak vždy vidí, kterou postavu si zvolil pro průchod hrou.
 */
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/styles/AppMenu.module.css';
import compassStyles from '@/styles/Compass.module.css';
import compassContainerStyles from '@/styles/CompassContainer.module.css';
import { getAvailableAvatars, getAllAvatars } from '../games/gameManager';
import Compass from './CompassNew';
import { useSocialStore } from '../store/socialStoreEnhanced';

// Definice dostupných avatarů - seznam všech dostupných avatarů z game manageru
export const avatarData = [
  {
    id: 'explorer',
    name: 'Průzkumník',
    imageUrl: '/assets/avatars/explorer.png'
  },
  {
    id: 'detective',
    name: 'Detektiv',
    imageUrl: '/assets/avatars/Detektiv.png'
  },
  {
    id: 'Bivoj',
    name: 'Bivoj',
    imageUrl: '/assets/avatars/Bivoj.png'
  },
  {
    id: 'princezna',
    name: 'Princezna',
    imageUrl: '/assets/avatars/princezna.png'
  },
  {
    id: 'ninja',
    name: 'Ninja',
    imageUrl: '/assets/avatars/Ninja.png'
  }
];

// Používáme všechny avatary místo filtrování jen dostupných
export const avatars = avatarData;

/**
 * Typová definice props pro AppMenu komponentu
 * @param selectedAvatarId - ID aktuálně vybraného avatara
 * @param onSelectAvatar - Volitelná funkce pro změnu avatara (pokud je menu aktivní)
 * @param onShowLeaderboard - Funkce pro zobrazení žebříčku
 * @param onShowTeamMode - Funkce pro zobrazení týmového režimu
 * @param onShowRouteManager - Funkce pro zobrazení správce tras
 * @param onShowTeamChat - Funkce pro zobrazení týmového chatu
 * @param onShowTeamChallenges - Funkce pro zobrazení týmových výzev
 * @param onShowTeamStats - Funkce pro zobrazení týmových statistik
 */
interface AppMenuProps {
  selectedAvatarId: string | null;
  onSelectAvatar?: (avatar: typeof avatars[0]) => void;
  onShowLeaderboard?: () => void;
  onShowTeamMode?: () => void;
  onShowRouteManager?: () => void;
  onShowTeamChat?: () => void;
  onShowTeamChallenges?: () => void;
  onShowTeamStats?: () => void;
}

/**
 * Komponenta zobrazující menu aplikace s vybraným avatarem
 */
const AppMenu: React.FC<AppMenuProps> = ({ 
  selectedAvatarId, 
  onSelectAvatar,
  onShowLeaderboard,
  onShowTeamMode,
  onShowRouteManager,
  onShowTeamChat,
  onShowTeamChallenges,
  onShowTeamStats
}) => {
  // Stav pro sledování, zda je kompas rozbalený
  const [isCompassExpanded, setIsCompassExpanded] = useState(false);
  // Stav pro zprávu o nedostupnosti avatara
  const [showUnavailableMessage, setShowUnavailableMessage] = useState(false);
  
  // Používáme socialStoreEnhanced pro přístup k počtu nepřečtených zpráv
  const { unreadChatCount, unreadEventsCount } = useSocialStore();
  // Najít aktuálně vybraný avatar podle jeho ID
  const selectedAvatar = avatars.find(avatar => avatar.id === selectedAvatarId) || avatars[0];

  // Kontrola dostupnosti avatara (zda je dostupný v gameManager)
  const isAvatarAvailable = (avatarId: string): boolean => {
    const availableGames = getAvailableAvatars();
    return availableGames.some(game => game.id === avatarId);
  };

  // Funkce pro přepínání rozbalení kompasu
  const handleToggleCompass = () => {
    setIsCompassExpanded(!isCompassExpanded);
  };
  return (
    <div className={styles['app-menu']}>
      <div className={styles['avatar-display']} title={selectedAvatar.name}>
        {selectedAvatar && (
          <div className={styles['current-avatar']}>
            <Image 
              src={selectedAvatar.imageUrl} 
              alt={selectedAvatar.name} 
              width={50}
              height={50}
              className={styles['avatar-icon']} 
            />
            {/* Text jména avatara je skrytý pomocí CSS ale přítomný pro přístupnost */}
            <span className={styles['avatar-name']}>{selectedAvatar.name}</span>
          </div>
        )}
      </div>
      
      {/* Sociální tlačítka */}
      <div className={styles['social-buttons']}>
        {onShowLeaderboard && (
          <button 
            className={styles['social-button']} 
            onClick={onShowLeaderboard}
            title="Žebříček výsledků"
            aria-label="Zobrazit žebříček výsledků"
          >
            🏆
          </button>
        )}
          {onShowTeamMode && (
          <button 
            className={styles['social-button']} 
            onClick={onShowTeamMode}
            title="Týmový režim"
            aria-label="Přepnout týmový režim"
          >
            👥
            {unreadEventsCount > 0 && (
              <span className={styles['notification-badge']}>{unreadEventsCount}</span>
            )}
          </button>
        )}
          {onShowRouteManager && (
          <button 
            className={styles['social-button']} 
            onClick={onShowRouteManager}
            title="Správa tras"
            aria-label="Správa a sdílení tras"
          >
            🗺️
          </button>
        )}        {onShowTeamChat && (
          <button 
            className={styles['social-button']} 
            onClick={onShowTeamChat}
            title="Týmový chat"
            aria-label="Otevřít týmový chat"
          >
            💬
            {unreadChatCount > 0 && (
              <span className={styles['notification-badge']}>{unreadChatCount}</span>
            )}
          </button>
        )}
          {onShowTeamChallenges && (
          <button 
            className={styles['social-button']} 
            onClick={onShowTeamChallenges}
            title="Týmové výzvy"
            aria-label="Otevřít týmové výzvy"
          >
            🏆
          </button>
        )}
        
        {onShowTeamStats && (
          <button 
            className={styles['social-button']} 
            onClick={onShowTeamStats}
            title="Týmové statistiky"
            aria-label="Zobrazit týmové statistiky"
          >
            📊
          </button>
        )}
      </div>
      
      {/* Kompas pod avatarem */}
      <div className={compassContainerStyles.compassFullContainer}>
        <Compass 
          isExpanded={isCompassExpanded}
          onToggleExpanded={handleToggleCompass}
        />
      </div>
    </div>
  );
};

export default AppMenu;