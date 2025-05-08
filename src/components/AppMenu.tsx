/**
 * Komponenta AppMenu - Zobrazuje hlavní menu aplikace s vybraným avatarem hráče
 * 
 * Tato komponenta slouží k zobrazení aktuálně vybraného avatara hráče v horní části aplikace.
 * Uživatel tak vždy vidí, kterou postavu si zvolil pro průchod hrou.
 */
import React from 'react';
import Image from 'next/image';
import styles from '@/styles/AppMenu.module.css';

// Definice dostupných avatarů - seznam všech herních postav, které si může uživatel vybrat
export const avatars = [
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
const AppMenu: React.FC<AppMenuProps> = ({ selectedAvatarId }) => {
  // Najít aktuálně vybraný avatar podle jeho ID
  const selectedAvatar = avatars.find(avatar => avatar.id === selectedAvatarId) || avatars[0];

  return (
    <div className={styles['app-menu']}>
      <div className={styles['avatar-display']}>
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
    </div>
  );
};

export default AppMenu;