import React, { useState } from 'react';
import { Flame } from 'lucide-react';

interface CandleProps {
  initialCount?: number;
  onLight?: () => void;
}

export const Candle: React.FC<CandleProps> = ({ initialCount = 0, onLight }) => {
  const [lit, setLit] = useState(false);
  const [count, setCount] = useState(initialCount);

  const handleLight = () => {
    if (!lit) {
      setLit(true);
      setCount(prev => prev + 1);
      if (onLight) onLight();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button 
        onClick={handleLight}
        className={`relative group transition-all duration-1000 ${lit ? 'cursor-default' : 'cursor-pointer'}`}
        aria-label="Light a candle"
        disabled={lit}
      >
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-amber-400 rounded-full blur-xl transition-opacity duration-1000 ${lit ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'}`}></div>
        
        {/* Candle Body */}
        <div className="relative flex items-center justify-center w-12 h-12 bg-slate-50 border border-slate-200 rounded-full shadow-sm">
           <Flame 
            className={`w-6 h-6 transition-all duration-1000 ${
              lit 
                ? 'text-amber-500 fill-amber-400 animate-pulse-slow scale-110' 
                : 'text-slate-300 group-hover:text-slate-400'
            }`} 
           />
        </div>
      </button>
      <span className="text-xs font-sans text-slate-400 tracking-wider">
        {lit ? 'You lit a candle' : `${count} candles lit`}
      </span>
    </div>
  );
};
