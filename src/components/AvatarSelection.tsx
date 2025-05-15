/**
 * Komponenta AvatarSelection - Umožňuje uživateli vybrat herní postavu (avatara)
 * 
 * Tato komponenta zobrazuje dostupné herní postavy a jejich podrobnosti včetně
 * popisu dobrodružství, obtížnosti, vzdálenosti a doby trvání hry. Uživatel může
 * kliknutím na avatara zobrazit jeho detaily a poté zahájit hru s vybranou postavou.
 */
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from '@/styles/AvatarSelection.module.css';
import baseStyles from '../styles/ScreenBase.module.css';
import { getAvailableAvatars } from '../games/gameManager';
import { useEnhancedOrientation } from '../hooks/useEnhancedOrientation';

/**
 * Rozhraní popisující informace o avatarovi
 */
interface AvatarInfo {
  name: string;        // Jméno avatara
  image: string;       // Cesta k obrázku avatara
  description: string; // Popis dobrodružství spojeného s tímto avatarem
  difficulty: string;  // Úroveň obtížnosti (Lehká, Střední, Obtížná)
  distance: string;    // Přibližná vzdálenost trasy
  duration: string;    // Přibližná doba trvání hry
  isAvailable?: boolean; // Zda je avatar/hra dostupná
}

/**
 * Props komponenty pro výběr avatara
 */
interface AvatarSelectionProps {
  onSelect: (avatar: string) => void; // Funkce volaná po výběru avatara
}

/**
 * Mapování na obtížnosti her
 */
const difficultyMap: Record<string, string> = {
  'explorer': 'Střední',
  'detective': 'Střední',
  'Bivoj': 'Lehká',
  'princezna': 'Lehká',
  'ninja': 'Obtížná',
};

/**
 * Mapování na vzdálenosti tras
 */
const distanceMap: Record<string, string> = {
  'explorer': '3 km',
  'detective': '2,5 km',
  'Bivoj': '1,8 km',
  'princezna': '1,5 km',
  'ninja': '2,7 km',
};

/**
 * Mapování na dobu trvání
 */
const durationMap: Record<string, string> = {
  'explorer': 'cca 100 minut',
  'detective': 'cca 90 minut',
  'Bivoj': 'cca 60 minut',
  'princezna': 'cca 50 minut',
  'ninja': 'cca 120 minut',
};

/**
 * Komponenta pro výběr avatara a zobrazení informací o herní postavě
 */
const AvatarSelection: React.FC<AvatarSelectionProps> = ({ onSelect }) => {
  // Stav pro uložení aktuálně vybraného avatara
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  // Stav pro uložení podrobných informací o vybraném avatarovi
  const [avatarInfo, setAvatarInfo] = useState<AvatarInfo | null>(null);
  // Stav pro uložení dostupných avatarů z gameManager
  const [availableAvatars, setAvailableAvatars] = useState<AvatarInfo[]>([]);
  // Stav pro detekci klientského renderování (pro SSR kompatibilitu)
  const [isClient, setIsClient] = useState(false);
  // Stav pro animaci odchodu
  const [isExiting, setIsExiting] = useState(false);
  // Hook pro detekci orientace a typu zařízení
  const { isLandscape, isAndroid, isSamsung, isLowPerformance } = useEnhancedOrientation();

  // Efekt pro nastavení klientského renderování
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Funkce pro získání CSS tříd na základě orientace a typu zařízení
  const getContainerClasses = useCallback(() => {
    let classes = `${styles.container}`;
    
    // Přidáváme třídy pro orientaci pouze na klientovi
    if (isClient) {
      if (isLandscape) {
        classes += ` ${baseStyles.landscapeContent}`;
        if (isSamsung) {
          classes += ` ${styles.samsungLandscape}`;
        }
      }
      
      if (isLowPerformance) {
        classes += ` ${styles.optimizedPerformance}`;
      }
      
      if (isAndroid) {
        classes += ` ${styles.androidOptimized}`;
      }
    }
    
    return classes;
  }, [isClient, isLandscape, isSamsung, isLowPerformance, isAndroid]);

  // Načtení všech avatarů z gameManager (místo jen dostupných)
  useEffect(() => {
    const loadAvatars = async () => {
      // Import nové funkce getAllAvatars
      const { getAllAvatars } = await import('../games/gameManager');
      const gameAvatars = getAllAvatars();
      
      // Převedení avatarů z gameManager na formát AvatarInfo, přidání atributu isAvailable
      const avatarsData: (AvatarInfo & { isAvailable: boolean })[] = gameAvatars.map(game => ({
        name: game.name,
        image: `/assets/avatars/${game.id}.png`,
        description: game.description,
        difficulty: difficultyMap[game.id] || 'Střední',
        distance: distanceMap[game.id] || '2,5 km',
        duration: durationMap[game.id] || 'cca 90 minut',
        isAvailable: game.isAvailable // přidáno, zda je hra dostupná
      }));
      
      setAvailableAvatars(avatarsData);
      
      // Automaticky vybrat první dostupný avatar, pokud existuje
      const availableAvatar = avatarsData.find(avatar => avatar.isAvailable);
      if (availableAvatar) {
        setSelectedAvatar(availableAvatar.name);
        setAvatarInfo(availableAvatar);
      } else if (avatarsData.length > 0) {
        // Pokud není dostupný žádný avatar, vybereme první
        setSelectedAvatar(avatarsData[0].name);
        setAvatarInfo(avatarsData[0]);
      }
    };
    
    loadAvatars();
  }, []);

  /**
   * Zpracovává kliknutí na avatara - nastaví vybraného avatara a jeho informace
   */
  const handleAvatarClick = (avatar: AvatarInfo) => {
    setSelectedAvatar(avatar.name);
    setAvatarInfo(avatar);
  };

  /**
   * Spustí hru s vybraným avatarem (s animací odchodu)
   */
  const handleStartGame = () => {
    if (selectedAvatar && avatarInfo) {
      // Kontrola dostupnosti vybraného avatara
      if (!avatarInfo.isAvailable) {
        alert("Na této únikové hře se pracuje. Hra není momentálně dostupná.");
        return;
      }

      // Zahájit animaci odchodu
      setIsExiting(true);
      
      // Najít ID avatara podle jeho jména
      const { getAllAvatars } = require('../games/gameManager');
      const selectedGame = getAllAvatars().find((game: any) => game.name === selectedAvatar);
      
      if (selectedGame) {
        // Přidáme timeout pro dokončení animace před přechodem
        setTimeout(() => {
          // Použít ID avatara pro přechod do další fáze
          onSelect(selectedGame.id);
        }, 300);
      }
    }
  };

  return (
    <div className={getContainerClasses()}>
      {/* Seznam všech avatarů */}
      <div className={`${styles.avatarList} ${isClient && isLandscape ? styles.landscapeAvatarList : ''}`}>
        {availableAvatars.map((avatar) => (
          <div
            key={avatar.name}
            className={`${styles.avatarItem} 
              ${selectedAvatar === avatar.name ? styles.selected : ''} 
              ${!avatar.isAvailable ? styles.avatarItemInactive : ''}
              ${isClient && isLandscape ? styles.landscapeAvatarItem : ''}`}
            onClick={() => handleAvatarClick(avatar)}
          >
            <Image
              src={avatar.image}
              alt={avatar.name}
              width={isClient && isLandscape ? 50 : 60}
              height={isClient && isLandscape ? 50 : 60}
              className={styles.avatarImage}
              style={!avatar.isAvailable ? { filter: 'grayscale(100%)', opacity: 0.7 } : {}}
            />
            <div className={styles.avatarName}>{avatar.name}</div>
            
            {/* Zpráva o nedostupnosti */}
            {!avatar.isAvailable && (
              <div className={styles.unavailableMessage}>
                Na této únikové hře se pracuje
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Panel s informacemi o vybraném avatarovi */}
      <div className={`${styles.infoPanel} ${isClient && isLandscape ? styles.landscapeInfoPanel : ''}`}>
        {avatarInfo ? (
          <>
            <h1 className={`${styles.infoTitle} ${isClient && isLandscape ? styles.landscapeInfoTitle : ''}`}>
              Informace o hře: {avatarInfo.name}
            </h1>
            <div className={`${styles.infoContent} ${isClient && isLandscape ? styles.landscapeInfoContent : ''}`}>
              <div className={`${styles.infoItem} ${isClient && isLandscape ? styles.landscapeInfoItem : ''}`}>
                <h2 className={styles.infoItemTitle}>Popis dobrodružství</h2>
                <p className={styles.infoItemDescription}>{avatarInfo.description}</p>
              </div>
              
              <div className={`${styles.infoItem} ${isClient && isLandscape ? styles.landscapeInfoItem : ''}`}>
                <h2 className={styles.infoItemTitle}>Detaily mise</h2>
                <p className={styles.infoItemDescription}>
                  <strong>Obtížnost:</strong> {avatarInfo.difficulty}<br />
                  <strong>Vzdálenost:</strong> {avatarInfo.distance}<br />
                  <strong>Doba trvání:</strong> {avatarInfo.duration}
                </p>
              </div>
            </div>            <button 
              className={`adventure-button button-large ${styles.startButton} ${isClient && isLandscape ? styles.landscapeStartButton : ''} ${avatarInfo && !avatarInfo.isAvailable ? styles.buttonDisabled : ''}`} 
              onClick={handleStartGame}
              disabled={avatarInfo && !avatarInfo.isAvailable}
              title={avatarInfo && !avatarInfo.isAvailable ? "Tato hra není momentálně dostupná" : "Začít hru s vybraným avatarem"}
            >
              {avatarInfo && !avatarInfo.isAvailable ? 'Hra není dostupná' : 'Začít hru'}
            </button>
          </>
        ) : (
          <div className={`${styles.infoContent} ${isClient && isLandscape ? styles.landscapeInfoContent : ''}`}>
            <h1 className={`${styles.infoTitle} ${isClient && isLandscape ? styles.landscapeInfoTitle : ''}`}>
              Vyberte avatara
            </h1>
            <p className={isClient && isLandscape ? styles.landscapeHelperText : ''}>
              {isClient && isLandscape ? "Vyberte avatara ze seznamu" : "Klikněte na jednoho z avatarů vlevo pro zobrazení podrobností o dané únikové hře."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarSelection;