import React, { useEffect, useState } from 'react';
import styles from '../styles/Social.module.css';
import { useSocialStore } from '../store/socialStoreEnhanced';
import { useGameStore } from '../store/gameStore';
import { LeaderboardEntry } from '../types/social';
import Image from 'next/image';

type LeaderboardProps = {
  showFriendsOnly?: boolean;
  onClose: () => void;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ showFriendsOnly = false, onClose }) => {
  const { leaderboard, friendsList, updateLeaderboard } = useSocialStore();
  const { playerName, avatarId, playerProgress } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'friends'>(showFriendsOnly ? 'friends' : 'all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      await updateLeaderboard();
      setLoading(false);
    };
    
    fetchLeaderboard();
  }, [updateLeaderboard]);

  // Přidání aktuálního uživatele do žebříčku, pokud tam není
  useEffect(() => {
    if (!loading && playerName) {
      const currentPlayerEntry: LeaderboardEntry = {
        playerId: 'current-user',
        playerName,
        score: playerProgress.score,
        rank: 0, // Prozatímní hodnota
        avatarId,
        achievements: Object.keys(playerProgress.badges || {})
          .filter(badgeId => playerProgress.badges?.[badgeId]?.earned)
      };
      
      const currentPlayerInLeaderboard = leaderboard.some(entry => entry.playerId === 'current-user');
      if (!currentPlayerInLeaderboard) {
        useSocialStore.getState().addLeaderboardEntry(currentPlayerEntry);
      }
    }
  }, [loading, playerName, playerProgress.score, avatarId, leaderboard]);

  const filteredLeaderboard = filter === 'friends' 
    ? leaderboard.filter(entry => friendsList.includes(entry.playerId) || entry.playerId === 'current-user')
    : leaderboard;

  // Seřazení leaderboardu podle skóre
  const sortedLeaderboard = [...filteredLeaderboard].sort((a, b) => b.score - a.score);

  // Funkce pro získání avatara podle ID
  const getAvatarImage = (avatarId: string) => {
    const defaultAvatar = '/assets/avatars/explorer.png';
    
    if (!avatarId) return defaultAvatar;
    
    const avatarMap: Record<string, string> = {
      'explorer': '/assets/avatars/explorer.png',
      'detective': '/assets/avatars/Detektiv.png',
      'Bivoj': '/assets/avatars/Bivoj.png',
      'princezna': '/assets/avatars/princezna.png',
      'ninja': '/assets/avatars/Ninja.png'
    };
    
    return avatarMap[avatarId] || defaultAvatar;
  };

  return (
    <div className={styles.socialModal}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Žebříček</h2>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabButton} ${filter === 'all' ? styles.activeTab : ''}`}
          onClick={() => setFilter('all')}
        >
          Všichni hráči
        </button>
        <button 
          className={`${styles.tabButton} ${filter === 'friends' ? styles.activeTab : ''}`}
          onClick={() => setFilter('friends')}
        >
          Přátelé
        </button>
      </div>
      
      <div className={styles.modalBody}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <p>Načítám žebříček...</p>
          </div>
        ) : sortedLeaderboard.length === 0 ? (
          <div className={styles.emptyListMessage}>
            <p>{filter === 'friends' ? 'Nemáte žádné přátele v žebříčku' : 'Žebříček je prázdný'}</p>
          </div>
        ) : (
          <div className={styles.leaderboardList}>
            {sortedLeaderboard.map((entry, index) => (
              <div 
                key={entry.playerId} 
                className={`${styles.leaderboardItem} ${entry.playerId === 'current-user' ? styles.currentPlayerItem : ''}`}
              >
                <div className={styles.rankColumn}>
                  <span className={styles.rankNumber}>#{index + 1}</span>
                </div>
                
                <div className={styles.playerColumn}>
                  <div className={styles.playerAvatar}>
                    <Image 
                      src={getAvatarImage(entry.avatarId)}
                      alt={entry.playerName}
                      width={40}
                      height={40}
                    />
                  </div>
                  
                  <div className={styles.playerInfo}>
                    <div className={styles.playerName}>
                      {entry.playerName}
                      {entry.playerId === 'current-user' && <span className={styles.youBadge}>Vy</span>}
                    </div>
                    
                    <div className={styles.achievementsContainer}>
                      {entry.achievements && entry.achievements.map((achievement, i) => (
                        <span key={i} className={styles.achievementBadge} title={achievement}>
                          🏆
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className={styles.scoreColumn}>
                  <span className={styles.scoreValue}>{entry.score}</span>
                  <span className={styles.scoreLabel}>bodů</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className={styles.leaderboardFooter}>
          <p className={styles.leaderboardNote}>
            Žebříček se aktualizuje každou hodinu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
