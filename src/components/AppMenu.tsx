import React from 'react';
import Image from 'next/image';
import styles from '@/styles/AppMenu.module.css';

// Definice dostupných avatarů
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

interface AppMenuProps {
  selectedAvatarId: string | null;
  onSelectAvatar?: (avatar: typeof avatars[0]) => void;
}

const AppMenu: React.FC<AppMenuProps> = ({ selectedAvatarId }) => {
  // Najít aktuálně vybraný avatar
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
            {/* Text jména avatara je skrytý pomocí CSS */}
            <span className={styles['avatar-name']}>{selectedAvatar.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppMenu;