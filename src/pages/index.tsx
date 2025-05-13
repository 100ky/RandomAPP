import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import GameControls from '../components/GameControls';
import PuzzleModal from '../components/PuzzleModal';
import LoadingScreen from '../components/LoadingScreen';
import AppMenu from '../components/AppMenu';
import SplashScreen from '../components/SplashScreen';
import AvatarSelection from '../components/AvatarSelection';
import LogoScreen from '../components/LogoScreen';

// Definice možných stavů aplikace
type AppState = 'loading' | 'logo' | 'avatar-selection' | 'splash' | 'game';

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
            // Po načtení přejít na obrazovku s logem
            setAppState('logo');
        }, 3000);

        return () => clearTimeout(loadingTimeout);
    }, []);

    // Handler pro ukončení obrazovky s logem
    const handleLogoFinish = () => {
        setAppState('avatar-selection');
    };
    
    // Handler pro ukončení obrazovky výběru avatara
    const handleAvatarSelectionFinish = (avatarId: string) => {
        setSelectedAvatarId(avatarId);
        // Nastavit jméno hráče podle avatara
        const defaultName = avatarId || 'Hráč';
        setPlayerName(defaultName);
        // Přejít na splash screen s tématem vybraného avatara
        setAppState('splash');
    };
    
    // Handler pro ukončení splash screenu
    const handleSplashFinish = () => {
        // Po splash screenu přejít do hry
        setAppState('game');
    };
    
    // Funkce volaná po výběru avatara (používáme handleAvatarSelectionFinish místo této funkce)
    const handleAvatarSelect = handleAvatarSelectionFinish;

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
            case 'logo':
                return <LogoScreen onContinue={handleLogoFinish} />;
            case 'avatar-selection':
                return <AvatarSelection onSelect={handleAvatarSelect} />;
            case 'splash':
                return <SplashScreen onFinish={handleSplashFinish} selectedAvatarId={selectedAvatarId} />;
            case 'game':
                return (
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