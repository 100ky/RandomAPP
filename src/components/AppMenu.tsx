import React, { useState } from 'react';

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
  onSelectAvatar: (avatar: typeof avatars[0]) => void;
  selectedAvatarId: string | null;
}

const AppMenu: React.FC<AppMenuProps> = ({ onSelectAvatar, selectedAvatarId }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleAvatarSelect = (avatar: typeof avatars[0]) => {
    onSelectAvatar(avatar);
    setIsMenuOpen(false);
  };

  // Najít aktuálně vybraný avatar
  const selectedAvatar = avatars.find(avatar => avatar.id === selectedAvatarId) || null;

  return (
    <div className="app-menu">
      <button className="menu-button" onClick={toggleMenu}>
        {selectedAvatar ? (
          <img 
            src={selectedAvatar.imageUrl} 
            alt={selectedAvatar.name} 
            className="avatar-icon" 
          />
        ) : (
          'Menu'
        )}
      </button>

      {isMenuOpen && (
        <div className="menu-dropdown">
          <h3>Vyberte svůj avatar</h3>
          <div className="avatar-grid">
            {avatars.map((avatar) => (
              <div 
                key={avatar.id}
                className={`avatar-option ${selectedAvatarId === avatar.id ? 'selected' : ''}`}
                onClick={() => handleAvatarSelect(avatar)}
              >
                <img src={avatar.imageUrl} alt={avatar.name} />
                <span>{avatar.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppMenu;