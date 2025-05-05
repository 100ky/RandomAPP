import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import GameControls from '../components/GameControls';
import PuzzleModal from '../components/PuzzleModal';
import LoadingScreen from '../components/LoadingScreen';
import AppMenu from '../components/AppMenu';
import StartMenu from '../components/StartMenu';

// Definice možných stavů aplikace
type AppState = 'loading' | 'start-menu' | 'game';

const Home: React.FC = () => {
    // Stav aplikace - načítání, úvodní menu nebo hra
    const [appState, setAppState] = useState<AppState>('loading');
    
    // Informace o hráči
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>('explorer');
    const [playerName, setPlayerName] = useState<string>('');
    
    // Stav hry - běží nebo ne
    const [isGameRunning, setIsGameRunning] = useState(false);

    // Při prvním načtení zobrazit načítací obrazovku
    useEffect(() => {
        const loadingTimeout = setTimeout(() => {
            // Po načtení přejít na úvodní menu
            setAppState('start-menu');
        }, 3000);

        return () => clearTimeout(loadingTimeout);
    }, []);

    // Funkce volaná po kliknutí na Start Game v úvodním menu
    const handleStartGame = (avatarId: string, name: string) => {
        setSelectedAvatarId(avatarId);
        setPlayerName(name);
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
            case 'start-menu':
                return <StartMenu onStartGame={handleStartGame} />;
            case 'game':
                return (
                    <div className="container">
                        <Map 
                            selectedAvatarId={selectedAvatarId}
                            animateToUserLocation={true}
                        />
                        <AppMenu 
                            selectedAvatarId={selectedAvatarId}
                            onSelectAvatar={handleAvatarChange}
                        />
                        <GameControls 
                            onStart={handleGameStart} 
                            onStop={handleGameStop}
                            isGameRunning={isGameRunning}
                        />
                        <PuzzleModal />
                    </div>
                );
            default:
                return null;
        }
    };

    return <>{renderContent()}</>;
};

export default Home;