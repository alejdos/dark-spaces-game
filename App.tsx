
import React, { useState, useCallback, useEffect } from 'react';
import Game from './components/Game';
import StartScreen from './components/screens/StartScreen';
import MissionBriefingScreen from './components/screens/MissionBriefingScreen';
import GameOverScreen from './components/screens/GameOverScreen';
import Starfield from './components/ui/Starfield';
import { GameStatus } from './types';
import { getMissionBriefing } from './services/geminiService';
import { LEVELS } from './constants';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.MENU);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [missionBriefing, setMissionBriefing] = useState<string>('');
  const [briefingError, setBriefingError] = useState<string>('');
  const [isLoadingBriefing, setIsLoadingBriefing] = useState<boolean>(false);

  const handleStartGame = useCallback(() => {
    setCurrentLevel(0);
    setGameStatus(GameStatus.BRIEFING);
  }, []);

  const handleStartMission = useCallback(() => {
    setGameStatus(GameStatus.PLAYING);
  }, []);

  const handleMissionEnd = useCallback((win: boolean) => {
    if (win) {
      const nextLevel = currentLevel + 1;
      if (nextLevel < LEVELS.length) {
        setCurrentLevel(nextLevel);
        setGameStatus(GameStatus.BRIEFING);
      } else {
        // Player has won the game
        setGameStatus(GameStatus.GAME_WON);
      }
    } else {
      setGameStatus(GameStatus.GAME_OVER);
    }
  }, [currentLevel]);
  
  const handleRestart = useCallback(() => {
      setCurrentLevel(0);
      setGameStatus(GameStatus.BRIEFING);
  }, []);

  useEffect(() => {
    if (gameStatus === GameStatus.BRIEFING) {
      const fetchBriefing = async () => {
        setIsLoadingBriefing(true);
        setBriefingError('');
        try {
          const levelData = LEVELS[currentLevel];
          const briefing = await getMissionBriefing(currentLevel + 1, levelData.enemies.map(e => e.type));
          setMissionBriefing(briefing);
        } catch (error) {
          console.error("Failed to get mission briefing:", error);
          const fallbackBriefing = `**// COMMAND ALERT: UPLINK FAILED //**\n\nTransmission lost. Could not retrieve mission briefing.\n\n**Mission ${currentLevel + 1}**\nPrimary Objective: Eradicate all hostile signatures in the designated quadrant. Enemy composition is unknown due to signal interference. Expect heavy resistance. Good luck, pilot. Command out.`;
          setMissionBriefing(fallbackBriefing);
        } finally {
          setIsLoadingBriefing(false);
        }
      };
      fetchBriefing();
    }
  }, [gameStatus, currentLevel]);

  const renderContent = () => {
    switch (gameStatus) {
      case GameStatus.MENU:
        return <StartScreen onStart={handleStartGame} />;
      case GameStatus.BRIEFING:
        return (
          <MissionBriefingScreen
            level={currentLevel + 1}
            briefing={missionBriefing}
            error={briefingError}
            isLoading={isLoadingBriefing}
            onStartMission={handleStartMission}
          />
        );
      case GameStatus.PLAYING:
        return <Game levelConfig={LEVELS[currentLevel]} onMissionEnd={handleMissionEnd} />;
      case GameStatus.GAME_OVER:
        return <GameOverScreen onRestart={handleRestart} message="Your ship was destroyed." title="MISSION FAILED" />;
      case GameStatus.GAME_WON:
        return <GameOverScreen onRestart={handleStartGame} message="You have defeated the enemy fleet. The sector is safe... for now." title="VICTORY!" />;
      default:
        return <StartScreen onStart={handleStartGame} />;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <Starfield />
      <div className="absolute inset-0 flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
