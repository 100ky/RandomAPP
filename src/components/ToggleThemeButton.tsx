import React, { useEffect, useState } from 'react';

// Přidání interface pro props
interface ToggleThemeButtonProps {
  className?: string; // className je nyní volitelný prop
}

/**
 * Komponenta pro přepínání mezi tmavým a světlým režimem v menu aplikace
 */
const ToggleThemeButton: React.FC<ToggleThemeButtonProps> = ({ className }) => {
  // Výchozí stav podle systémového nastavení nebo uloženého nastavení
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  // Načtení a nastavení režimu při inicializaci
  useEffect(() => {
    // Zjistíme aktuální režim z localStorage, pokud existuje
    const savedTheme = localStorage.getItem('color-theme');
    
    // Nastavíme stav podle uloženého nastavení nebo defaultně světlý režim
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else {
      // Výchozí světlý režim (ignorujeme systémovou preferenci)
      setIsDarkMode(false);
      // Nastavíme data-theme atribut na světlý režim
      document.documentElement.setAttribute('data-theme', 'light');
      // Uložíme preferenci do localStorage
      localStorage.setItem('color-theme', 'light');
    }
  }, []);

  // Přepínání mezi režimy
  const toggleTheme = () => {
    // Přepnutí stavu
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    
    // Nastavení atributu data-theme na kořenovém elementu
    document.documentElement.setAttribute(
      'data-theme', 
      newDarkModeState ? 'dark' : 'light'
    );
    
    // Uložení preference do localStorage
    localStorage.setItem('color-theme', newDarkModeState ? 'dark' : 'light');
  };

  return (
    // Použití předaného className prop, pokud existuje, jinak výchozí třída
    <button onClick={toggleTheme} className={className || "menu-theme-toggle-button"}>
      {isDarkMode ? (
        // Ikona slunce pro tmavý režim (přepne na světlý)
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 0 1-1V1a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1zm0 19a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1zM5 12a1 1 0 0 0-1-1H1a1 1 0 0 0 0 2h3a1 1 0 0 0 1-1zm19-1h-3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2zM6.36 6.36a1 1 0 0 0-1.41-1.41l-1.42 1.42a1 1 0 0 0 1.41 1.41l1.42-1.42zm12.69 12.69a1 1 0 0 0-1.41-1.41l-1.42 1.42a1 1 0 0 0 1.41 1.41l1.42-1.42zM6.34 17.66a1 1 0 0 0 1.41 1.41l1.42-1.42a1 1 0 0 0-1.41-1.41l-1.42 1.42zM19.07 5.93a1 1 0 0 0-1.41 1.41l1.42 1.42a1 1 0 0 0 1.41-1.41l-1.42-1.42z" />
        </svg>
      ) : (
        // Ikona měsíce pro světlý režim (přepne na tmavý)
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
        </svg>
      )}
      {isDarkMode ? 'Světlý režim' : 'Tmavý režim'}
    </button>
  );
};

export default ToggleThemeButton;
