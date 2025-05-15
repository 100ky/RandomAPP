import React, { useState, useEffect } from 'react';
import styles from '../styles/Challenge.module.css';
import { useSocialStore } from '../store/socialStoreEnhanced';
import { useGameStore } from '../store/gameStore';

interface TeamChallengeProps {
  onClose: () => void;
}

// Definice týmové výzvy
interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  type: 'distance' | 'steps' | 'locations' | 'puzzles';
  reward: number;
  deadline: number | null; // Časový limit v ms nebo null pro neomezený čas
  isCompleted: boolean;
}

const TeamChallenges: React.FC<TeamChallengeProps> = ({ onClose }) => {
  const { isTeamMode, teamName, teamMembers } = useSocialStore();
  const { playerProgress } = useGameStore();
  
  // Stav pro sledování týmových výzev
  const [challenges, setChallenges] = useState<TeamChallenge[]>([]);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  
  // Vytvořit demo výzvy při načtení
  useEffect(() => {
    if (isTeamMode) {
      const demoDate = new Date();
      demoDate.setDate(demoDate.getDate() + 1); // zítra
      
      const demoChallenges: TeamChallenge[] = [
        {
          id: '1',
          title: 'Společný průzkum',
          description: 'Projděte společně 2 km v týmovém režimu.',
          targetValue: 2000,
          currentValue: 850,
          type: 'distance',
          reward: 500,
          deadline: demoDate.getTime(),
          isCompleted: false
        },
        {
          id: '2',
          title: 'Aktivní tým',
          description: 'Ujděte společně 5000 kroků v týmovém režimu.',
          targetValue: 5000,
          currentValue: 2300,
          type: 'steps',
          reward: 1000,
          deadline: null,
          isCompleted: false
        },
        {
          id: '3',
          title: 'Průzkumníci města',
          description: 'Objevte všech 5 hlavních lokací ve městě.',
          targetValue: 5,
          currentValue: 2,
          type: 'locations',
          reward: 2000,
          deadline: null,
          isCompleted: false
        },
        {
          id: '4',
          title: 'Mistři hádanek',
          description: 'Vyřešte společně 10 hádanek.',
          targetValue: 10,
          currentValue: 10,
          type: 'puzzles',
          reward: 1500,
          deadline: null,
          isCompleted: true
        }
      ];
      
      setChallenges(demoChallenges);
    }
  }, [isTeamMode]);
  
  // Funkce pro formátování zbývajícího času
  const formatTimeRemaining = (deadline: number) => {
    const now = Date.now();
    const diff = deadline - now;
    
    if (diff < 0) return 'Vypršelo';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  // Funkce pro získání procentuálního postupu
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };
  
  // Funkce pro získání ikony podle typu výzvy
  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'distance':
        return '🗺️';
      case 'steps':
        return '👣';
      case 'locations':
        return '🏛️';
      case 'puzzles':
        return '🧩';
      default:
        return '🏆';
    }
  };
  
  if (!isTeamMode) {
    return (
      <div className={styles.teamChallengeContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Týmové výzvy</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.noTeamMessage}>
          <p>Pro využití týmových výzev se musíte nejprve připojit k týmu.</p>
          <button 
            className={styles.createTeamButton}
            onClick={onClose}
          >
            Zavřít
          </button>
        </div>
      </div>
    );
  }
  
  const activeChallenges = challenges.filter(c => !c.isCompleted);
  const completedChallenges = challenges.filter(c => c.isCompleted);
  
  return (
    <div className={styles.teamChallengeContainer}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Týmové výzvy: {teamName}</h2>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${selectedTab === 'active' ? styles.activeTab : ''}`}
          onClick={() => setSelectedTab('active')}
        >
          Aktivní ({activeChallenges.length})
        </button>
        <button 
          className={`${styles.tabButton} ${selectedTab === 'completed' ? styles.activeTab : ''}`}
          onClick={() => setSelectedTab('completed')}
        >
          Dokončené ({completedChallenges.length})
        </button>
      </div>
      
      <div className={styles.modalBody}>
        <div className={styles.challengesList}>
          {selectedTab === 'active' ? (
            activeChallenges.length > 0 ? (
              activeChallenges.map(challenge => (
                <div key={challenge.id} className={styles.challengeCard}>
                  <div className={styles.challengeHeader}>
                    <div className={styles.challengeIcon}>{getChallengeIcon(challenge.type)}</div>
                    <div className={styles.challengeTitle}>{challenge.title}</div>
                    <div className={styles.challengeReward}>+{challenge.reward} bodů</div>
                  </div>
                  <p className={styles.challengeDescription}>{challenge.description}</p>
                  <div className={styles.challengeProgress}>
                    <div className={styles.challengeProgressBar}>
                      <div 
                        className={styles.challengeProgressFill} 
                        style={{ width: `${getProgressPercentage(challenge.currentValue, challenge.targetValue)}%` }}
                      ></div>
                    </div>
                    <div className={styles.challengeProgressText}>
                      {challenge.currentValue} / {challenge.targetValue}
                    </div>
                  </div>
                  {challenge.deadline && (
                    <div className={styles.challengeDeadline}>
                      Zbývá: {formatTimeRemaining(challenge.deadline)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>Žádné aktivní výzvy</p>
              </div>
            )
          ) : (
            completedChallenges.length > 0 ? (
              completedChallenges.map(challenge => (
                <div key={challenge.id} className={`${styles.challengeCard} ${styles.completedChallenge}`}>
                  <div className={styles.challengeHeader}>
                    <div className={styles.challengeIcon}>{getChallengeIcon(challenge.type)}</div>
                    <div className={styles.challengeTitle}>{challenge.title}</div>
                    <div className={styles.challengeReward}>+{challenge.reward} bodů</div>
                  </div>
                  <p className={styles.challengeDescription}>{challenge.description}</p>
                  <div className={styles.challengeProgress}>
                    <div className={styles.challengeProgressBar}>
                      <div 
                        className={styles.challengeProgressFill} 
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                    <div className={styles.challengeCompleted}>
                      Dokončeno!
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>Žádné dokončené výzvy</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamChallenges;
