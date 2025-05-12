import React, { useState, useEffect } from 'react';
import styles from '../styles/AchievementNotification.module.css';
import { SoundType, playSound } from '../utils/SoundManager';

interface AchievementNotificationProps {
  title: string;
  message: string;
  points?: number;
  onClose?: () => void;
  autoCloseTime?: number; // Čas v ms po kterém se notifikace automaticky zavře
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  title,
  message,
  points = 0,
  onClose,
  autoCloseTime = 5000
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Přehrát zvuk při zobrazení úspěchu
    playSound(SoundType.ACHIEVEMENT);
    
    // Automaticky zavřít notifikaci po definované době
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseTime);
    
    return () => clearTimeout(timer);
  }, [autoCloseTime]);
  
  const handleClose = () => {
    setVisible(false);
    
    // Volat callback po zavření, pokud byl poskytnut
    if (onClose) {
      setTimeout(onClose, 500); // Dát čas na animaci před plným odebráním
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className={styles.achievement}>
      <div className={styles.achievementHeader}>
        <div className={styles.achievementIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3 className={styles.achievementTitle}>{title}</h3>
        <button className={styles.closeButton} onClick={handleClose}>×</button>
      </div>
      
      <div className={styles.achievementBody}>
        <p>{message}</p>
        
        {points > 0 && (
          <div className={styles.rewardInfo}>
            <div className={styles.rewardPoints}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
              +{points} bodů
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementNotification;
