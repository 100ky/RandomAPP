/**
 * Animace přechodů mezi stránkami/obrazovkami v aplikaci
 * využívá CSS a React pro plynulejší UX
 */
import React, { useState, useEffect, ReactNode, createContext, useContext } from 'react';
import styles from '../styles/PageTransition.module.css';

// Typy animací přechodu
export type TransitionType = 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'none';

// Rozhraní pro kontext přechodů
interface PageTransitionContextType {
  navigateTo: (path: string, transitionType?: TransitionType) => void;
  currentPath: string;
}

// Výchozí hodnoty kontextu
const defaultContext: PageTransitionContextType = {
  navigateTo: () => {},
  currentPath: '',
};

// Vytvoření kontextu pro navigaci
const PageTransitionContext = createContext<PageTransitionContextType>(defaultContext);

// Hook pro přístup k navigaci s přechody
export const usePageTransition = () => useContext(PageTransitionContext);

interface PageTransitionProviderProps {
  children: ReactNode;
}

// Poskytovatel kontextu pro navigaci s přechody
export const PageTransitionProvider: React.FC<PageTransitionProviderProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionType, setTransitionType] = useState<TransitionType>('fade');

  // Funkce pro navigaci s animací
  const navigateTo = (path: string, type: TransitionType = 'fade') => {
    if (path === currentPath || isTransitioning) return;

    setTransitionType(type);
    setIsTransitioning(true);
    
    // Po dokončení animace aktualizujeme URL a stav
    setTimeout(() => {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
      setIsTransitioning(false);
    }, 300); // 300ms je délka animace v CSS
  };

  // Detekce změny URL při použití tlačítek zpět/vpřed
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <PageTransitionContext.Provider value={{ navigateTo, currentPath }}>
      <div className={`
        ${styles.pageTransitionContainer} 
        ${isTransitioning ? styles.transitioning : ''}
        ${isTransitioning ? styles[`transition-${transitionType}`] : ''}
      `}>
        {children}
      </div>
    </PageTransitionContext.Provider>
  );
};

// Komponenta pro stránku s animací přechodu
interface PageTransitionProps {
  children: ReactNode;
  path: string;  // Cesta, která odpovídá této stránce
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, path }) => {
  const { currentPath } = usePageTransition();
  const [isVisible, setIsVisible] = useState<boolean>(path === currentPath);
  const [wasEverVisible, setWasEverVisible] = useState<boolean>(path === currentPath);

  useEffect(() => {
    // Pokud se cesta shoduje, zobrazíme stránku
    if (path === currentPath) {
      setIsVisible(true);
      setWasEverVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [path, currentPath]);

  // Lazy loading - komponenta se vůbec nevykreslí, dokud nebyla nikdy viditelná
  if (!wasEverVisible) {
    return null;
  }

  // Komponenta se vykreslí, ale může být skrytá
  return (
    <div className={`${styles.page} ${isVisible ? styles.visiblePage : styles.hiddenPage}`}>
      {children}
    </div>
  );
};

// Animované odkazy s přechody
interface TransitionLinkProps {
  to: string;
  type?: TransitionType;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TransitionLink: React.FC<TransitionLinkProps> = ({ 
  to, 
  type = 'fade', 
  children,
  className,
  onClick
}) => {
  const { navigateTo } = usePageTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    navigateTo(to, type);
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};
