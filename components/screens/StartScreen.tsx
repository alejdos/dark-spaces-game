import React from 'react';
import Button from '../ui/Button';
import { CONTROLS } from '../../constants';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="text-center text-white flex flex-col items-center p-8 bg-black/50 backdrop-blur-md border-2 border-cyan-500/30 rounded-lg">
      <h1 className="text-8xl font-black text-glow tracking-widest text-cyan-300 mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        DARK SPACES
      </h1>
      <p className="text-xl text-cyan-200 mb-12 max-w-2xl">
        The last bastion of humanity is under siege. As an elite pilot, your mission is to repel the alien armada and secure our future. The void awaits.
      </p>
      
      <div className="mb-12">
        <Button onClick={onStart}>
          Engage
        </Button>
      </div>
      
      <div className="text-cyan-400 border border-cyan-700/50 bg-black/30 p-4 rounded-md">
        <h2 className="text-2xl font-bold mb-2 text-glow">Controls</h2>
        <ul className="text-left grid grid-cols-2 gap-x-8 gap-y-2 text-lg">
          <li><span className="font-bold text-white w-12 inline-block uppercase">{CONTROLS.THRUST}</span> - Thrust</li>
          <li><span className="font-bold text-white w-12 inline-block uppercase">{CONTROLS.BRAKE}</span> - Brake</li>
          <li><span className="font-bold text-white w-12 inline-block uppercase">{CONTROLS.STRAFE_LEFT}</span> - Strafe Left</li>
          <li><span className="font-bold text-white w-12 inline-block uppercase">{CONTROLS.STRAFE_RIGHT}</span> - Strafe Right</li>
          <li className="col-span-2"><span className="font-bold text-white w-24 inline-block">Mouse</span> - Aim</li>
          <li className="col-span-2"><span className="font-bold text-white w-24 inline-block">Click / Space</span> - Fire Lasers</li>
        </ul>
      </div>

    </div>
  );
};

export default StartScreen;