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
 */
interface AppMenuProps {
  selectedAvatarId: string | null;
  onSelectAvatar?: (avatar: typeof avatars[0]) => void;
}

/**
 * Komponenta zobrazující menu aplikace s vybraným avatarem
 */
const AppMenu: React.FC<AppMenuProps> = ({ selectedAvatarId, onSelectAvatar }) => {
  // Stav pro sledování, zda je kompas rozbalený
  const [isCompassExpanded, setIsCompassExpanded] = useState(false);
  // Stav pro sledování, zda je menu avatarů otevřené
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  // Stav pro zprávu o nedostupnosti avatara
  const [showUnavailableMessage, setShowUnavailableMessage] = useState(false);
  
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

  // Přepínání menu avatarů
  const toggleAvatarMenu = () => {
    setIsAvatarMenuOpen(!isAvatarMenuOpen);
  };

  // Zpracování kliknutí na avatar
  const handleAvatarClick = (avatar: typeof avatars[0]) => {
    // Pokud je avatar dostupný a máme k dispozici funkci pro změnu avatara
    if (isAvatarAvailable(avatar.id) && onSelectAvatar) {
      onSelectAvatar(avatar);
      setIsAvatarMenuOpen(false); // Zavřít menu
    } else {
      // Avatar není dostupný, zobrazíme zprávu
      alert("Na této únikové hře se pracuje. Hra není momentálně dostupná.");
    }
  };

  return (
    <div className={styles['app-menu']}>
      <div 
        className={styles['avatar-display']} 
        onClick={toggleAvatarMenu}
        title="Klikněte pro zobrazení všech avatarů"
      >
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

      {/* Menu s avatary */}
      {onSelectAvatar && (
        <div className={`${styles['avatar-menu']} ${isAvatarMenuOpen ? styles.visible : ''}`}>
          {avatars.map((avatar) => {
            const isAvailable = isAvatarAvailable(avatar.id);
            return (
              <div 
                key={avatar.id}
                className={`${styles['avatar-option']} ${!isAvailable ? styles['avatar-inactive'] : ''}`}
                onClick={() => handleAvatarClick(avatar)}
              >
                <Image 
                  src={avatar.imageUrl} 
                  alt={avatar.name} 
                  width={30}
                  height={30}
                  className={styles['avatar-option-image']}
                  style={!isAvailable ? { filter: 'grayscale(100%)', opacity: 0.7 } : {}} 
                />
                <span>{avatar.name}</span>
                {!isAvailable && (
                  <span className={styles['avatar-inactive-message']}>
                    Na únikové hře se pracuje
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
      
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