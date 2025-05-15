import React, { useState, useEffect } from 'react';
import styles from '../styles/TeamStats.module.css';
import { useSocialStore } from '../store/socialStoreEnhanced';
import { useGameStore } from '../store/gameStore';

interface TeamStatsProps {
  onClose: () => void;
}

interface TeamStats {
  totalDistance: number;
  totalSteps: number;
  locationsVisited: number;
  puzzlesSolved: number;
  totalTime: number;
  memberContributions: {
    [memberId: string]: {
      distance: number;
      steps: number;
      locations: number;
      puzzles: number;
    };
  };
}

const TeamStats: React.FC<TeamStatsProps> = ({ onClose }) => {
  const { isTeamMode, teamName, teamMembers } = useSocialStore();
  const { playerProgress } = useGameStore();
  
  const [selectedStat, setSelectedStat] = useState<'distance' | 'steps' | 'locations' | 'puzzles'>('distance');
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (isTeamMode) {
      // Simulujeme načítání statistik týmu
      setTimeout(() => {
        // Vygenerujeme ukázkové statistiky
        const demoStats: TeamStats = {
          totalDistance: 12350, // metry
          totalSteps: 16500,
          locationsVisited: 8,
          puzzlesSolved: 12,
          totalTime: 18000000, // 5 hodin v ms
          memberContributions: {}
        };
        
        // Vygenerujeme příspěvky jednotlivých členů
        teamMembers.forEach(member => {
          // Pro každého člena náhodně rozdělíme celkové hodnoty
          const distanceFactor = Math.random() * 0.6 + 0.2; // 20-80%
          const stepsFactor = Math.random() * 0.6 + 0.2; // 20-80%
          const locationsFactor = Math.random() * 0.6 + 0.2; // 20-80%
          const puzzlesFactor = Math.random() * 0.6 + 0.2; // 20-80%
          
          demoStats.memberContributions[member.id] = {
            distance: Math.round(demoStats.totalDistance * distanceFactor),
            steps: Math.round(demoStats.totalSteps * stepsFactor),
            locations: Math.round(demoStats.locationsVisited * locationsFactor),
            puzzles: Math.round(demoStats.puzzlesSolved * puzzlesFactor)
          };
        });
        
        setTeamStats(demoStats);
        setIsLoading(false);
      }, 1000);
    }
  }, [isTeamMode, teamMembers]);
  
  // Formátování vzdálenosti
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };
  
  // Formátování času
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };
  
  // Funkce pro zobrazení procentuálního zastoupení člena týmu
  const getMemberContributionPercentage = (memberId: string, statType: keyof TeamStats['memberContributions'][string]) => {
    if (!teamStats) return 0;
    
    const contribution = teamStats.memberContributions[memberId]?.[statType] || 0;
    let total = 0;
    
    switch (statType) {
      case 'distance':
        total = teamStats.totalDistance;
        break;
      case 'steps':
        total = teamStats.totalSteps;
        break;
      case 'locations':
        total = teamStats.locationsVisited;
        break;
      case 'puzzles':
        total = teamStats.puzzlesSolved;
        break;
    }
    
    return total > 0 ? (contribution / total) * 100 : 0;
  };
  
  // Funkce pro získání pořadí členů týmu podle příspěvku
  const getSortedMembers = (statType: keyof TeamStats['memberContributions'][string]) => {
    if (!teamStats) return [];
    
    return [...teamMembers].sort((a, b) => {
      const contributionA = teamStats.memberContributions[a.id]?.[statType] || 0;
      const contributionB = teamStats.memberContributions[b.id]?.[statType] || 0;
      return contributionB - contributionA;
    });
  };
  
  // Vybrat ikonu podle typu statistiky
  const getStatIcon = () => {
    switch (selectedStat) {
      case 'distance':
        return '🗺️';
      case 'steps':
        return '👣';
      case 'locations':
        return '🏛️';
      case 'puzzles':
        return '🧩';
    }
  };
  
  // Vybrat jednotku podle typu statistiky
  const getStatUnit = () => {
    switch (selectedStat) {
      case 'distance':
        return 'km';
      case 'steps':
        return 'kroků';
      case 'locations':
        return 'lokací';
      case 'puzzles':
        return 'hádanek';
    }
  };
  
  // Vybrat hodnotu podle typu statistiky
  const getStatValue = (memberId: string) => {
    if (!teamStats) return 0;
    
    const stats = teamStats.memberContributions[memberId];
    if (!stats) return 0;
    
    switch (selectedStat) {
      case 'distance':
        return stats.distance;
      case 'steps':
        return stats.steps;
      case 'locations':
        return stats.locations;
      case 'puzzles':
        return stats.puzzles;
    }
  };
  
  // Formátovat hodnotu podle typu statistiky
  const formatStatValue = (value: number) => {
    switch (selectedStat) {
      case 'distance':
        return formatDistance(value);
      default:
        return value.toString();
    }
  };
  
  if (!isTeamMode) {
    return (
      <div className={styles.teamStatsContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Týmové statistiky</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.noTeamMessage}>
          <p>Pro zobrazení týmových statistik se musíte nejprve připojit k týmu.</p>
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
  
  if (isLoading || !teamStats) {
    return (
      <div className={styles.teamStatsContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Týmové statistiky</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.loadingStats}>
            <p>Načítání statistik...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.teamStatsContainer}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Statistiky týmu: {teamName}</h2>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      
      <div className={styles.modalBody}>
        <div className={styles.teamOverview}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🗺️</div>
            <div className={styles.statValue}>{formatDistance(teamStats.totalDistance)}</div>
            <div className={styles.statLabel}>Celková vzdálenost</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👣</div>
            <div className={styles.statValue}>{teamStats.totalSteps}</div>
            <div className={styles.statLabel}>Celkem kroků</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏛️</div>
            <div className={styles.statValue}>{teamStats.locationsVisited}</div>
            <div className={styles.statLabel}>Navštívených míst</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏱️</div>
            <div className={styles.statValue}>{formatTime(teamStats.totalTime)}</div>
            <div className={styles.statLabel}>Celkový čas</div>
          </div>
        </div>
        
        <div className={styles.contributionsSection}>
          <h3>Příspěvky členů týmu</h3>
          
          <div className={styles.statTypeSelector}>
            <button 
              className={`${styles.statTypeButton} ${selectedStat === 'distance' ? styles.selectedStatType : ''}`}
              onClick={() => setSelectedStat('distance')}
            >
              Vzdálenost
            </button>
            <button 
              className={`${styles.statTypeButton} ${selectedStat === 'steps' ? styles.selectedStatType : ''}`}
              onClick={() => setSelectedStat('steps')}
            >
              Kroky
            </button>
            <button 
              className={`${styles.statTypeButton} ${selectedStat === 'locations' ? styles.selectedStatType : ''}`}
              onClick={() => setSelectedStat('locations')}
            >
              Lokace
            </button>
            <button 
              className={`${styles.statTypeButton} ${selectedStat === 'puzzles' ? styles.selectedStatType : ''}`}
              onClick={() => setSelectedStat('puzzles')}
            >
              Hádanky
            </button>
          </div>
          
          <div className={styles.contributionsList}>
            {getSortedMembers(selectedStat).map((member, index) => {
              const contribution = getStatValue(member.id);
              const percentage = getMemberContributionPercentage(member.id, selectedStat);
              
              return (
                <div key={member.id} className={styles.memberContribution}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberRank}>#{index + 1}</div>
                    <div className={styles.memberName}>{member.name}</div>
                    <div className={styles.memberValue}>
                      {formatStatValue(contribution)} {getStatUnit()}
                    </div>
                  </div>
                  <div className={styles.contributionBar}>
                    <div 
                      className={styles.contributionFill}
                      style={{ width: `${percentage}%` }}
                    ></div>
                    <div className={styles.contributionPercentage}>
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className={styles.visualizationSection}>
          <h3>Vizualizace příspěvků</h3>
          <div className={styles.pieChart}>
            {/* Zde by byl skutečný graf, pro ukázku jen jednoduchá reprezentace */}
            <div className={styles.pieChartPlaceholder}>
              {getStatIcon()} Statistika {selectedStat}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamStats;
