import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Candle: React.FC<{ onLight?: () => void }> = ({ onLight }) => {
  const [isLit, setIsLit] = useState(false);

  const handleClick = () => {
    if (!isLit) {
      setIsLit(true);
      if (onLight) onLight();
    }
  };

  return (
    <div 
      className="flex flex-col items-center cursor-pointer group"
      onClick={handleClick}
    >
      <div className="relative w-8 h-24">
        {/* Flame */}
        <AnimatePresence>
          {isLit && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-6 bg-gradient-to-t from-orange-400 to-yellow-200 rounded-full blur-[2px] z-10"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 0.95, 1], rotate: [-1, 1, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full"
              />
              {/* Glow */}
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.6 }}
                 transition={{ duration: 2 }}
                 className="absolute -top-4 -left-4 w-12 h-16 bg-orange-300 rounded-full blur-xl opacity-40"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Candle Body */}
        <div className="w-full h-full bg-slate-200 rounded-sm shadow-inner group-hover:bg-slate-100 transition-colors duration-500 flex justify-center">
            {/* Wick */}
            <div className="w-[2px] h-3 bg-slate-400 -mt-3"></div>
        </div>
      </div>
      
      <p className={`mt-4 text-xs tracking-widest uppercase transition-colors duration-700 ${isLit ? 'text-amber-600' : 'text-slate-400'}`}>
        {isLit ? 'Memory Lit' : 'Light a Candle'}
      </p>
    </div>
  );
};