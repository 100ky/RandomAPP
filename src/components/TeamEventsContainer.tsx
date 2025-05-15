import React, { useEffect, useState } from 'react';
import styles from '../styles/Social.module.css';
import { useSocialStore } from '../store/socialStoreEnhanced';
import TeamEventNotification from './TeamEventNotification';

interface TeamEventsContainerProps {}

const TeamEventsContainer: React.FC<TeamEventsContainerProps> = () => {
  const { teamEvents, teamId, isTeamMode, dismissTeamEvent } = useSocialStore();
  const [visibleEvents, setVisibleEvents] = useState<string[]>([]);
  
  // Zobrazit pouze maximálně 3 nejnovější notifikace najednou
  useEffect(() => {
    if (!isTeamMode || !teamId) {
      setVisibleEvents([]);
      return;
    }
    
    // Zobrazit max. 3 nejnovější události
    const eventIds = teamEvents
      .slice(0, 3)
      .map(event => event.id);
      
    setVisibleEvents(eventIds);
  }, [teamEvents, isTeamMode, teamId]);
  
  const handleDismiss = (eventId: string) => {
    setVisibleEvents(prev => prev.filter(id => id !== eventId));
    dismissTeamEvent(eventId);
  };
  
  if (!isTeamMode || visibleEvents.length === 0) return null;
  
  return (
    <div className={styles.teamEventsContainer}>
      {visibleEvents.map(eventId => {
        const event = teamEvents.find(e => e.id === eventId);
        if (!event) return null;
        
        return (
          <TeamEventNotification 
            key={event.id}
            event={event}
            onDismiss={handleDismiss}
          />
        );
      })}
    </div>
  );
};

export default TeamEventsContainer;
