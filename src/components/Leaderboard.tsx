import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSocialStore } from '../store/socialStore';
import { useGameStore } from '../store/gameStore';
import { LeaderboardEntry } from '../types/social';

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
  }, []);

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
  }, [loading, playerName, playerProgress.score]);

  const filteredLeaderboard = filter === 'friends' 
    ? leaderboard.filter(entry => friendsList.includes(entry.playerId) || entry.playerId === 'current-user')
    : leaderboard;

  // Aktualizace pořadí v žebříčku
  const rankedLeaderboard = [...filteredLeaderboard].sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.playerId === 'current-user';
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
    
    return (
      <View style={[styles.leaderboardItem, isCurrentUser && styles.currentUserItem]}>
        <Text style={styles.rank}>{medal || `${item.rank}.`}</Text>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: `/assets/avatars/${item.avatarId}.png` }} 
            style={styles.avatar} 
          />
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>
            {item.playerName} {isCurrentUser && '(Ty)'}
          </Text>
          <View style={styles.badgesContainer}>
            {item.achievements.slice(0, 3).map(badge => (
              <Text key={badge} style={styles.badgeIcon}>🏆</Text>
            ))}
            {item.achievements.length > 3 && <Text style={styles.badgeIcon}>+{item.achievements.length - 3}</Text>}
          </View>
        </View>
        <Text style={styles.score}>{item.score}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Žebříček výsledků</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]} 
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.activeFilterButtonText]}>Všichni</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'friends' && styles.activeFilterButton]} 
          onPress={() => setFilter('friends')}
        >
          <Text style={[styles.filterButtonText, filter === 'friends' && styles.activeFilterButtonText]}>Přátelé</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Načítání žebříčku...</Text>
        </View>
      ) : (
        <FlatList
          data={rankedLeaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={item => item.playerId}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#4287f5',
  },
  filterButtonText: {
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  listContent: {
    padding: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentUserItem: {
    backgroundColor: 'rgba(66, 135, 245, 0.1)',
  },
  rank: {
    width: 30,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontWeight: '500',
    fontSize: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  badgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4287f5',
    minWidth: 50,
    textAlign: 'right',
  },
});

export default Leaderboard;
