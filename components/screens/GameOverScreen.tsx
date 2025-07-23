
import React from 'react';
import Button from '../ui/Button';

interface GameOverScreenProps {
  onRestart: () => void;
  message: string;
  title: string;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart, message, title }) => {
  const isVictory = title.toLowerCase().includes('victory');
  const titleClass = isVictory ? 'text-green-400 text-glow-green' : 'text-red-500 text-glow-red';

  return (
    <div className="text-center text-white flex flex-col items-center p-12 bg-black/60 backdrop-blur-md border-2 border-cyan-500/50 rounded-lg">
      <h1 className={`text-7xl font-black tracking-widest mb-4 ${titleClass}`}>
        {title}
      </h1>
      <p className="text-2xl text-cyan-200 mb-12 max-w-xl">
        {message}
      </p>
      <Button onClick={onRestart}>
        {isVictory ? 'Return to Menu' : 'Try Again'}
      </Button>
    </div>
  );
};

export default GameOverScreen;
