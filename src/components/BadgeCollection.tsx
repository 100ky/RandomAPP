import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { badges } from '../data/badges';
import Badge from './Badge';
import styles from '../styles/BadgeCollection.module.css';
import { BadgeCategory, BadgeRarity } from '../types/game';

// Tato komponenta zobrazuje kolekci všech dostupných odznaků rozdělených podle kategorií
const BadgeCollection: React.FC = () => {
  const { playerProgress, hasBadge } = useGameStore();
  
  // State pro filtrování odznaků
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<BadgeRarity | 'all'>('all');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);
  
  // Kategorie odznaků pro filtrování
  const categories: { label: string; value: BadgeCategory | 'all' }[] = [
    { label: 'Vše', value: 'all' },
    { label: 'Průzkum', value: 'exploration' },
    { label: 'Hádanky', value: 'puzzle' },
    { label: 'Aktivita', value: 'activity' },
    { label: 'Speciální', value: 'special' },
  ];
  
  // Vzácnosti odznaků pro filtrování
  const rarities: { label: string; value: BadgeRarity | 'all' }[] = [
    { label: 'Vše', value: 'all' },
    { label: 'Běžný', value: 'common' },
    { label: 'Neobvyklý', value: 'uncommon' },
    { label: 'Vzácný', value: 'rare' },
    { label: 'Legendární', value: 'legendary' },
  ];
  
  // Filtrování odznaků podle vybraných kritérií
  const filteredBadges = badges.filter(badge => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && badge.rarity !== selectedRarity) return false;
    if (showOnlyUnlocked && !hasBadge(badge.id)) return false;
    return true;
  });
  
  // Seskupení odznaků podle kategorií pro zobrazení
  const badgesByCategory: Record<BadgeCategory, typeof badges> = {
    exploration: [],
    puzzle: [],
    activity: [],
    special: [],
  };
  
  filteredBadges.forEach(badge => {
    badgesByCategory[badge.category].push(badge);
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Odznaky</h1>
      
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Kategorie:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value as BadgeCategory | 'all')}
            className={styles.select}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Vzácnost:</label>
          <select 
            value={selectedRarity} 
            onChange={(e) => setSelectedRarity(e.target.value as BadgeRarity | 'all')}
            className={styles.select}
          >
            {rarities.map(rarity => (
              <option key={rarity.value} value={rarity.value}>
                {rarity.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={showOnlyUnlocked} 
              onChange={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
              className={styles.checkbox}
            />
            Pouze odemčené
          </label>
        </div>
      </div>
      
      <div className={styles.badgeStats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Získáno:</span>
          <span className={styles.statValue}>
            {Object.keys(playerProgress.badges).length} z {badges.length}
          </span>
        </div>
      </div>

      {/* Zobrazení odznaků podle kategorií */}
      {Object.entries(badgesByCategory).map(([category, categoryBadges]) => {
        if (categoryBadges.length === 0) return null;
        
        return (
          <div key={category} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>
              {categories.find(c => c.value === category)?.label || category}
            </h2>
            <div className={styles.badgeGrid}>
              {categoryBadges.map(badge => (
                <div key={badge.id} className={styles.badgeWrapper}>
                  <Badge 
                    badge={badge} 
                    isUnlocked={hasBadge(badge.id)} 
                    showInfo={true}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BadgeCollection;