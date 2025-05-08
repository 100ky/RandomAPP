/**
 * Komponenta AvatarSelection - Umožňuje uživateli vybrat herní postavu (avatara)
 * 
 * Tato komponenta zobrazuje dostupné herní postavy a jejich podrobnosti včetně
 * popisu dobrodružství, obtížnosti, vzdálenosti a doby trvání hry. Uživatel může
 * kliknutím na avatara zobrazit jeho detaily a poté zahájit hru s vybranou postavou.
 */
import React, { useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/AvatarSelection.module.css';

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
 * Seznam dostupných avatarů s jejich podrobnými informacemi
 */
const avatarsInfo: AvatarInfo[] = [
  {
    name: 'Detektiv',
    image: '/assets/avatars/Detektiv.png',
    description: 'Vydejte se po stopách zločinu! Jako zkušený detektiv budete řešit záhadu zmizelého historického artefaktu ve Vysokém Mýtě. Vaším úkolem bude shromáždit důkazy, vyslýchat svědky a odhalit pachatele.',
    difficulty: 'Střední',
    distance: '2,5 km',
    duration: 'cca 90 minut'
  },
  {
    name: 'Bivoj',
    image: '/assets/avatars/Bivoj.png',
    description: 'Silák Bivoj vás provede dobrodružnou výpravou po městských památkách. Budete muset prokázat nejen sílu, ale i důvtip při řešení historických hádanek spojených s místními pověstmi a legendami.',
    difficulty: 'Lehká',
    distance: '1,8 km',
    duration: 'cca 60 minut'
  },
  {
    name: 'Průzkumník',
    image: '/assets/avatars/explorer.png',
    description: 'Vydejte se na expedici do neznámých zákoutí Vysokého Mýta! Jako zkušený průzkumník objevíte skrytá místa, tajemné uličky a zapomenuté památky. Připravte se na dobrodružnou cestu plnou objevování.',
    difficulty: 'Střední',
    distance: '3 km',
    duration: 'cca 100 minut'
  },
  {
    name: 'Ninja',
    image: '/assets/avatars/Ninja.png',
    description: 'Tajemná úniková hra pro ty, kteří hledají výzvu! Jako ninja se budete muset plížit městem, řešit komplexní hádanky a překonávat překážky s maximální obratností a důvtipem.',
    difficulty: 'Obtížná',
    distance: '2,7 km',
    duration: 'cca 120 minut'
  },
  {
    name: 'Princezna',
    image: '/assets/avatars/princezna.png',
    description: 'Pohádková cesta královským městem! Jako princezna budete objevovat kouzelná místa, pomáhat pohádkovým bytostem a řešit hádanky, které prověří vaši laskavost a moudrost.',
    difficulty: 'Lehká',
    distance: '1,5 km',
    duration: 'cca 50 minut'
  },
];

/**
 * Komponenta pro výběr avatara a zobrazení informací o herní postavě
 */
const AvatarSelection: React.FC<AvatarSelectionProps> = ({ onSelect }) => {
  // Stav pro uložení aktuálně vybraného avatara
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  // Stav pro uložení podrobných informací o vybraném avatarovi
  const [avatarInfo, setAvatarInfo] = useState<AvatarInfo | null>(null);

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
      onSelect(selectedAvatar);
    }
  };

  return (
    <div className={styles.container}>
      {/* Seznam dostupných avatarů */}
      <div className={styles.avatarList}>
        {avatarsInfo.map((avatar) => (
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