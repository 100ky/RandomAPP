/**
 * Komponenta AvatarSelection - Umožňuje uživateli vybrat herní postavu (avatara)
 * 
 * Tato komponenta zobrazuje dostupné herní postavy a jejich podrobnosti včetně
 * popisu dobrodružství, obtížnosti, vzdálenosti a doby trvání hry. Uživatel může
 * kliknutím na avatara zobrazit jeho detaily a poté zahájit hru s vybranou postavou.
 */
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/styles/AvatarSelection.module.css';
import { getAvailableAvatars } from '../games/gameManager';

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

  // Načtení dostupných avatarů z gameManager
  useEffect(() => {
    const loadAvatars = async () => {
      const gameAvatars = getAvailableAvatars();
      
      // Převedení avatarů z gameManager na formát AvatarInfo
      const avatarsData: AvatarInfo[] = gameAvatars.map(game => ({
        name: game.name,
        image: `/assets/avatars/${game.id}.png`,
        description: game.description,
        difficulty: difficultyMap[game.id] || 'Střední',
        distance: distanceMap[game.id] || '2,5 km',
        duration: durationMap[game.id] || 'cca 90 minut',
      }));
      
      setAvailableAvatars(avatarsData);
      
      // Automaticky vybrat první dostupný avatar, pokud existuje
      if (avatarsData.length > 0) {
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
   * Spustí hru s vybraným avatarem
   */
  const handleStartGame = () => {
    if (selectedAvatar) {
      // Najít ID avatara podle jeho jména
      const selectedGame = getAvailableAvatars().find(game => game.name === selectedAvatar);
      if (selectedGame) {
        // Použít ID avatara pro přechod do další fáze
        onSelect(selectedGame.id);
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Seznam dostupných avatarů */}
      <div className={styles.avatarList}>
        {availableAvatars.map((avatar) => (
          <div
            key={avatar.name}
            className={`${styles.avatarItem} ${selectedAvatar === avatar.name ? styles.selected : ''}`}
            onClick={() => handleAvatarClick(avatar)}
          >
            <Image
              src={avatar.image}
              alt={avatar.name}
              width={60}
              height={60}
              className={styles.avatarImage}
            />
            <div className={styles.avatarName}>{avatar.name}</div>
          </div>
        ))}
      </div>
      
      {/* Panel s informacemi o vybraném avatarovi */}
      <div className={styles.infoPanel}>
        {avatarInfo ? (
          <>
            <h1 className={styles.infoTitle}>Informace o hře: {avatarInfo.name}</h1>
            <div className={styles.infoContent}>
              <div className={styles.infoItem}>
                <h2 className={styles.infoItemTitle}>Popis dobrodružství</h2>
                <p className={styles.infoItemDescription}>{avatarInfo.description}</p>
              </div>
              
              <div className={styles.infoItem}>
                <h2 className={styles.infoItemTitle}>Detaily mise</h2>
                <p className={styles.infoItemDescription}>
                  <strong>Obtížnost:</strong> {avatarInfo.difficulty}<br />
                  <strong>Vzdálenost:</strong> {avatarInfo.distance}<br />
                  <strong>Doba trvání:</strong> {avatarInfo.duration}
                </p>
              </div>
            </div>
            <button className={styles.startButton} onClick={handleStartGame}>
              Začít hru
            </button>
          </>
        ) : (
          <div className={styles.infoContent}>
            <h1 className={styles.infoTitle}>Vyberte avatara</h1>
            <p>Klikněte na jednoho z avatarů vlevo pro zobrazení podrobností o dané únikové hře.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarSelection;