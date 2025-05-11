import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import GameControls from '../components/GameControls';
import PuzzleModal from '../components/PuzzleModal';
import LoadingScreen from '../components/LoadingScreen';
import AppMenu from '../components/AppMenu';
import SplashScreen from '../components/SplashScreen';
import AvatarSelection from '../components/AvatarSelection';

// Definice možných stavů aplikace
type AppState = 'loading' | 'splash' | 'avatar-selection' | 'game';

const Home: React.FC = () => {
    // Stav aplikace - načítání, splash screen, výběr avatara nebo hra
    const [appState, setAppState] = useState<AppState>('loading');
    
    // Informace o hráči
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string>('');
    
    // Stav hry - běží nebo ne
    const [isGameRunning, setIsGameRunning] = useState(false);

    // Při prvním načtení zobrazit načítací obrazovku
    useEffect(() => {
        const loadingTimeout = setTimeout(() => {
            // Po načtení přejít na splash screen
            setAppState('splash');
        }, 3000);

        return () => clearTimeout(loadingTimeout);
    }, []);

    // Handler pro ukončení splash screenu
    const handleSplashFinish = () => {
        setAppState('avatar-selection');
    };
    
    // Funkce volaná po výběru avatara
    const handleAvatarSelect = (avatarId: string) => {
        setSelectedAvatarId(avatarId);
        
        // Lze také odvodit výchozí jméno hráče podle avatara
        const defaultName = avatarId || 'Hráč';
        setPlayerName(defaultName);
        
        // Přepnout do herního režimu
        setAppState('game');
    };

    // Funkce pro změnu avatara během hry
    const handleAvatarChange = (avatar: {id: string, name: string, imageUrl: string}) => {
        setSelectedAvatarId(avatar.id);
        localStorage.setItem('userAvatarId', avatar.id);
    };
    
    // Funkce pro spuštění hry
    const handleGameStart = () => {
        console.log(`Hra zahájena pro hráče: ${playerName}`);
        setIsGameRunning(true);
        // Zde můžete přidat další logiku pro zahájení hry
        // například začít sledovat polohu hráče, aktivovat hádanky, atd.
    };
    
    // Funkce pro zastavení hry
    const handleGameStop = () => {
        console.log('Hra ukončena');
        setIsGameRunning(false);
        // Zde můžete přidat další logiku pro ukončení hry
        // například ukládat výsledky, zobrazit souhrn, atd.
    };

    // Renderování obsahu podle stavu aplikace
    const renderContent = () => {
        switch (appState) {
            case 'loading':
                return <LoadingScreen />;
            case 'splash':
                return <SplashScreen onFinish={handleSplashFinish} />;
            case 'avatar-selection':
                return <AvatarSelection onSelect={handleAvatarSelect} />;            case 'game':                return (
                    <div className="container">
                        <Map 
                            selectedAvatarId={selectedAvatarId}
                            animateToUserLocation={true}
                            onEndGame={handleGameStop}
                        />
                        <AppMenu 
                            selectedAvatarId={selectedAvatarId}
                            onSelectAvatar={handleAvatarChange}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return <>{renderContent()}</>;
};

export default Home;