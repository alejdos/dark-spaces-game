
import React from 'react';
import Button from '../ui/Button';

interface MissionBriefingScreenProps {
  level: number;
  briefing: string;
  error: string;
  isLoading: boolean;
  onStartMission: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-400"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-400" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-400" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const MissionBriefingScreen: React.FC<MissionBriefingScreenProps> = ({
  level,
  briefing,
  error,
  isLoading,
  onStartMission,
}) => {
  return (
    <div className="flex flex-col items-center text-center max-w-4xl w-full p-8 bg-black/60 backdrop-blur-md border-2 border-cyan-500/50 rounded-lg">
      <h1 className="text-5xl font-bold text-glow-yellow mb-4">INCOMING TRANSMISSION...</h1>
      <h2 className="text-3xl font-semibold text-glow mb-8">MISSION {level} BRIEFING</h2>
      
      <div className="w-full h-64 overflow-y-auto p-4 mb-8 text-left text-xl text-green-300 bg-black/50 border border-green-500/50 rounded-md font-mono leading-relaxed">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
                <LoadingSpinner />
                <p className="mt-4 text-glow-green">Decrypting mission data...</p>
            </div>
        ) : error ? (
          <p className="text-red-400 text-glow-red">{error}</p>
        ) : (
          <p style={{ whiteSpace: 'pre-wrap' }}>{briefing}</p>
        )}
      </div>

      <Button onClick={onStartMission} disabled={isLoading}>
        {isLoading ? 'Awaiting Orders...' : 'Launch Mission'}
      </Button>
    </div>
  );
};

export default MissionBriefingScreen;
