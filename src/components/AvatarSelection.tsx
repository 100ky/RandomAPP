import React, { useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/AvatarSelection.module.css';

interface AvatarInfo {
  name: string;
  image: string;
  description: string;
  difficulty: string;
  distance: string;
  duration: string;
}

interface AvatarSelectionProps {
  onSelect: (avatar: string) => void;
}

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

const AvatarSelection: React.FC<AvatarSelectionProps> = ({ onSelect }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarInfo, setAvatarInfo] = useState<AvatarInfo | null>(null);

  const handleAvatarClick = (avatar: AvatarInfo) => {
    setSelectedAvatar(avatar.name);
    setAvatarInfo(avatar);
  };

  const handleStartGame = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
    }
  };

  return (
    <div className={styles.container}>
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