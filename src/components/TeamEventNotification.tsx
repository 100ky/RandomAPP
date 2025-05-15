import React, { useEffect, useState } from 'react';
import styles from '../styles/Social.module.css';
import { TeamMember } from '../types/social';

type TeamEventNotificationProps = {
  event: TeamEvent;
  onDismiss: (id: string) => void;
};

export type TeamEventType = 'join' | 'leave' | 'location-update' | 'achievement';

export interface TeamEvent {
  id: string;
  type: TeamEventType;
  timestamp: number;
  memberId: string;
  memberName: string;
  message: string;
  read: boolean;
}

const TeamEventNotification: React.FC<TeamEventNotificationProps> = ({ event, onDismiss }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // Automaticky skrýt notifikaci po 5 sekundách
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(event.id), 300); // Počkat na dokončení animace
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [event.id, onDismiss]);
  
  // Vybrat ikonu podle typu události
  const getEventIcon = () => {
    switch (event.type) {
      case 'join':
        return '👋';
      case 'leave':
        return '👋';
      case 'location-update':
        return '📍';
      case 'achievement':
        return '🏆';
      default:
        return '📣';
    }
  };
  
  return (
    <div className={`${styles.teamEventNotification} ${visible ? styles.visible : styles.hidden} team-event-notification`}>
      <div className={styles.eventIcon}>{getEventIcon()}</div>
      <div className={styles.eventContent}>
        <div className={styles.eventHeader}>
          <span className={styles.eventMemberName}>{event.memberName}</span>
          <span className={styles.eventTime}>
            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className={styles.eventMessage}>{event.message}</p>
      </div>
      <button 
        className={styles.dismissButton}
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(event.id), 300);
        }}
        aria-label="Zavřít notifikaci"
      >
        ×
      </button>
    </div>
  );
};

export default TeamEventNotification;
