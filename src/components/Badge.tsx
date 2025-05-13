import React, { FC } from 'react';
import { Badge as BadgeType } from '../types/game';
import { useGameStore } from '../store/gameStore';
import styles from '../styles/Badge.module.css';
import { getBadgeById } from '../data/badges';

interface BadgeProps {
  badgeId: string;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onClick?: (badge: BadgeType) => void;
}

/**
 * Komponenta pro zobrazení jednotlivého odznaku
 */
const Badge: FC<BadgeProps> = ({ badgeId, size = 'medium', showProgress = false, onClick }) => {
  const gameStore = useGameStore();
  const hasBadge = gameStore.hasBadge(badgeId);
  const currentProgress = gameStore.getBadgeProgress(badgeId);
  
  // Získáme data odznaku
  const badge = getBadgeById(badgeId);
    // Vypočítáme procento postupu již není potřeba, přesunuto dolů
  
  if (!badge) {
    return null;
  }
  
  // Pro tajné odznaky, které hráč ještě nemá, zobrazíme pouze siluetu
  if (badge.isSecret && !hasBadge) {
    return (
      <div 
        className={`${styles.badge} ${styles[size]} ${styles.secret}`}
        title="Tajný odznak"
        onClick={() => onClick && onClick(badge)}
      >
        <div className={styles.icon}>?</div>
        <div className={styles.name}>???</div>
      </div>
    );  }
  
  // Výpočet procentuálního postupu
  const maxProgress = badge.maxProgress || 1;
  const progressPercent = Math.min(100, Math.round((currentProgress / maxProgress) * 100));
  
  return (
    <div 
      className={`${styles.badge} ${styles[size]} ${styles[badge.rarity]} ${!hasBadge ? styles.locked : ''}`}
      title={hasBadge ? badge.description : badge.earnCondition}
      onClick={() => onClick && onClick(badge)}
    >
      <div className={styles.icon}>
        {badge.icon}
      </div>
      <div className={styles.content}>
        <div className={styles.name}>{badge.name}</div>
        
        {hasBadge && (
          <div className={styles.rarityTag}>{badge.rarity}</div>
        )}
            {!hasBadge && showProgress && badge.isProgressBased && (
          <div className={styles.progressContainer}>            <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
            <div className={styles.progressText}>{currentProgress}/{maxProgress}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Badge;