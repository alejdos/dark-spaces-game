
import React from 'react';
import { Player } from '../types';

interface HUDProps {
  player: Player;
  enemiesLeft: number;
}

const StatusBar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="w-64">
      <div className="flex justify-between text-lg text-glow">
        <span>{label}</span>
        <span>{Math.round(value)}/{maxValue}</span>
      </div>
      <div className="w-full bg-cyan-900/50 rounded-sm overflow-hidden h-4 border-2 border-cyan-500/50">
        <div
          className={`h-full rounded-sm transition-all duration-300`}
          style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
};

const HUD: React.FC<HUDProps> = ({ player, enemiesLeft }) => {
  if (!player || !player.id) {
    return null; // Don't render HUD if player data is not available
  }

  return (
    <>
      {/* Bottom Left Player Status */}
      <div className="absolute bottom-5 left-5 text-cyan-300 p-4 bg-black/30 border-2 border-cyan-500/50 rounded-md backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-glow mb-2">PILOT STATUS</h2>
        <StatusBar value={player.shield} maxValue={player.maxShield} color="#00aaff" label="SHIELD" />
        <div className="mt-2" />
        <StatusBar value={player.hull} maxValue={player.maxHull} color="#00ff88" label="HULL" />
      </div>

      {/* Top Right Enemy Counter */}
      <div className="absolute top-5 right-5 text-red-400 p-4 bg-black/30 border-2 border-red-500/50 rounded-md backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-glow-red">HOSTILES</h3>
        <p className="text-4xl font-black text-center text-glow-red">{enemiesLeft}</p>
      </div>
    </>
  );
};

export default HUD;
