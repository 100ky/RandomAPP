import React, { useEffect, useState } from 'react';
import styles from '../styles/ThemeToggle.module.css';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  // Výchozí režim je systémový nebo světlý
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  // Nastavení režimu podle uloženého nastavení nebo výchozí světlý režim
  useEffect(() => {
    // Pokud existuje uložené nastavení, použijeme ho
    const savedTheme = localStorage.getItem('color-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      setTheme('light'); // Výchozí hodnota je light místo system
      // Vždy nastavit světlý režim jako výchozí, ignorovat systémová nastavení
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('color-theme', 'light');
    }
  }, []);

  // Přepínání mezi režimy
  const toggleTheme = () => {
    if (theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('color-theme', 'dark');
      setTheme('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('color-theme', 'light');
      setTheme('light');
    }
  };

  // Sledování změn systémového nastavení
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        document.documentElement.setAttribute(
          'data-theme', 
          mediaQuery.matches ? 'dark' : 'light'
        );
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <button 
      className={`${styles.themeToggle} ${className || ''}`} 
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
      aria-label={theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
    >
      {/* Ikona pro tmavý režim - měsíc */}
      <svg 
        className={`${styles.moonIcon} ${theme === 'dark' ? styles.active : ''}`}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
      >
        <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
      </svg>
      
      {/* Ikona pro světlý režim - slunce */}
      <svg 
        className={`${styles.sunIcon} ${theme === 'dark' ? '' : styles.active}`}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
      >
        <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 0 1-1V1a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1zm0 19a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1zM5 12a1 1 0 0 0-1-1H1a1 1 0 0 0 0 2h3a1 1 0 0 0 1-1zm19-1h-3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2zM6.36 6.36a1 1 0 0 0-1.41-1.41l-1.42 1.42a1 1 0 0 0 1.41 1.41l1.42-1.42zm12.69 12.69a1 1 0 0 0-1.41-1.41l-1.42 1.42a1 1 0 0 0 1.41 1.41l1.42-1.42zM6.34 17.66a1 1 0 0 0 1.41 1.41l1.42-1.42a1 1 0 0 0-1.41-1.41l-1.42 1.42zM19.07 5.93a1 1 0 0 0-1.41 1.41l1.42 1.42a1 1 0 0 0 1.41-1.41l-1.42-1.42z" />
      </svg>
    </button>
  );
};

export default ThemeToggle;
