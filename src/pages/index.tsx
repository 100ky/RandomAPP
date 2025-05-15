import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import GameControls from '../components/GameControls';
import PuzzleModal from '../components/PuzzleModal';
import LoadingScreen from '../components/LoadingScreen';
import AppMenu from '../components/AppMenu';
import SplashScreen from '../components/SplashScreen';
import AvatarSelection from '../components/AvatarSelection';
import LogoScreen from '../components/LogoScreen';
import Leaderboard from '../components/LeaderboardWeb';
import TeamMode from '../components/TeamMode';
import RouteManager from '../components/RouteManagerWeb';
import TeamEventsContainer from '../components/TeamEventsContainer';
import TeamChat from '../components/TeamChat';
import TeamChallenges from '../components/TeamChallenges';
import TeamStats from '../components/TeamStats';
import ShareRoute from '../components/ShareRoute';
import { Route } from '../types/social';
import { useSocialStore } from '../store/socialStoreEnhanced';

// Definice možných stavů aplikace
type AppState = 'loading' | 'logo' | 'avatar-selection' | 'splash' | 'game';

// Definice modálních stavů aplikace
type ModalState = null | 'leaderboard' | 'team-mode' | 'routes' | 'team-chat' | 'team-challenges' | 'team-stats' | 'share-route';

const Home: React.FC = () => {
    // Stav aplikace - načítání, splash screen, výběr avatara nebo hra
    const [appState, setAppState] = useState<AppState>('loading');
    
    // Stav modálního okna pro sociální funkce
    const [modalState, setModalState] = useState<ModalState>(null);
    
    // Vybraná trasa pro zobrazení na mapě
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    
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

    // Handler pro zavření modálních oken
    const handleCloseModal = () => {
        setModalState(null);
    };
    
    // Handler pro zobrazení žebříčku
    const handleShowLeaderboard = () => {
        setModalState('leaderboard');
    };
    
    // Handler pro zobrazení týmového režimu
    const handleShowTeamMode = () => {
        setModalState('team-mode');
    };
    
    // Handler pro zobrazení správce tras
    const handleShowRouteManager = () => {
        setModalState('routes');
    };
    
    // Handler pro zobrazení chatu týmu
    const handleShowTeamChat = () => {
        setModalState('team-chat');
    };
      // Handler pro zobrazení týmových výzev
    const handleShowTeamChallenges = () => {
        setModalState('team-challenges');
    };
    
    // Handler pro zobrazení týmových statistik
    const handleShowTeamStats = () => {
        setModalState('team-stats');
    };
    
    // Handler pro zobrazení sdílení trasy
    const handleShowShareRoute = (route: Route) => {
        setSelectedRoute(route);
        setModalState('share-route');
    };
    
    // Handler pro zobrazení trasy na mapě
    const handleViewRoute = (route: Route) => {
        setSelectedRoute(route);
        handleCloseModal();
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
                return <SplashScreen onFinish={handleSplashFinish} selectedAvatarId={selectedAvatarId} />;              case 'game':
                return (                    <div className="container">
                        <Map 
                            selectedAvatarId={selectedAvatarId}
                            animateToUserLocation={true}
                            onEndGame={handleGameStop}
                            selectedRoute={selectedRoute}
                        />
                        <TeamEventsContainer />                        <AppMenu 
                            selectedAvatarId={selectedAvatarId}
                            onShowLeaderboard={handleShowLeaderboard}
                            onShowTeamMode={handleShowTeamMode}
                            onShowRouteManager={handleShowRouteManager}
                            onShowTeamChat={handleShowTeamChat}
                            onShowTeamChallenges={handleShowTeamChallenges}
                            onShowTeamStats={handleShowTeamStats}
                        />
                        
                        {/* Modální okna pro sociální funkce */}
                        {modalState === 'leaderboard' && (
                            <div className="modal-container">
                                <Leaderboard onClose={handleCloseModal} />
                            </div>
                        )}
                        
                        {modalState === 'team-mode' && (
                            <div className="modal-container">
                                <TeamMode onClose={handleCloseModal} />
                            </div>
                        )}                        {modalState === 'routes' && (
                            <div className="modal-container">
                                <RouteManager 
                                    onClose={handleCloseModal} 
                                    onViewRoute={handleViewRoute}
                                    onShare={handleShowShareRoute}
                                />
                            </div>
                        )}
                          {modalState === 'team-chat' && (
                            <div className="modal-container">
                                <TeamChat onClose={handleCloseModal} />
                            </div>
                        )}
                          {modalState === 'team-challenges' && (
                            <div className="modal-container">
                                <TeamChallenges onClose={handleCloseModal} />
                            </div>
                        )}
                        
                        {modalState === 'team-stats' && (
                            <div className="modal-container">
                                <TeamStats onClose={handleCloseModal} />
                            </div>
                        )}
                        
                        {modalState === 'share-route' && selectedRoute && (
                            <div className="modal-container">
                                <ShareRoute route={selectedRoute} onClose={handleCloseModal} />
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return <>{renderContent()}</>;
};

export default Home;