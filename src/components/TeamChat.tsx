import React, { useState, useRef, useEffect } from 'react';
import { useSocialStore } from '../store/socialStoreEnhanced';
import styles from '../styles/Chat.module.css';
import { ChatMessage } from '../types/social';

interface TeamChatProps {
  onClose: () => void;
}

const TeamChat: React.FC<TeamChatProps> = ({ onClose }) => {
  const { 
    chatMessages, 
    sendChatMessage, 
    clearChatHistory, 
    teamMembers, 
    isTeamMode, 
    teamName,
    markAllChatAsRead
  } = useSocialStore();
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Vždy scrollovat na poslední zprávu
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  // Po otevření chatu označit všechny zprávy jako přečtené
  useEffect(() => {
    markAllChatAsRead();
    inputRef.current?.focus();
  }, [markAllChatAsRead]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(message);
      setMessage('');
    }
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Funkce pro zobrazení HTML třídy zprávy podle typu
  const getMessageClass = (msg: ChatMessage) => {
    if (msg.isSystem) {
      return styles.systemMessage;
    }
    return msg.memberId === 'current-user' ? styles.ourMessage : styles.theirMessage;
  };
  
  if (!isTeamMode) {
    return (
      <div className={styles.teamChatContainer}>
        <div className={styles.teamChatHeader}>
          <h2>Týmový chat</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.noTeamMessage}>
          <p>Pro použití chatu se musíte nejprve připojit k týmu.</p>
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
  
  return (
    <div className={styles.teamChatContainer}>
      <div className={styles.teamChatHeader}>
        <h2>{teamName || 'Týmový chat'}</h2>
        <div className={styles.headerActions}>
          <button 
            className={styles.clearChatButton} 
            onClick={clearChatHistory}
            title="Vymazat historii chatu"
          >
            🗑️
          </button>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
      </div>
      
      <div className={styles.teamMembersInfo}>
        <span>Aktivní členové: </span>
        {teamMembers.map(member => (
          <span key={member.id} className={styles.teamMember}>
            {member.name}
          </span>
        )).reduce((prev, curr, i) => (
          // Přidání oddělovačů mezi jména
          i === 0 ? [curr] : [...prev, ', ', curr]
        ), [] as React.ReactNode[])}
      </div>
      
      <div className={styles.chatMessages}>
        {chatMessages.length === 0 ? (
          <div className={styles.emptyChat}>
            <p>Žádné zprávy. Začněte konverzaci!</p>
          </div>
        ) : (
          chatMessages.map(msg => (
            <div key={msg.id} className={`${styles.chatMessage} ${getMessageClass(msg)}`}>
              {/* Nezobrazujeme jméno u vlastních zpráv a u systémových zpráv */}
              {msg.memberId !== 'current-user' && !msg.isSystem && (
                <div className={styles.messageSender}>{msg.memberName}</div>
              )}
              <div className={styles.messageContent}>
                <div className={styles.messageText}>{msg.text}</div>
                <div className={styles.messageTime}>{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className={styles.chatInputForm} onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          className={styles.chatInput}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Napište zprávu..."
        />
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={!message.trim()}
        >
          Odeslat
        </button>
      </form>
    </div>
  );
};

export default TeamChat;
