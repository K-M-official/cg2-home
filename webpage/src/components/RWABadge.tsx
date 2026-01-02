import React from 'react';
import { motion } from 'framer-motion';

export const RWABadge: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, rotateY: 10 }}
      className="relative w-64 h-80 bg-gradient-to-br from-slate-100 to-slate-300 rounded-xl shadow-2xl border border-white/50 overflow-hidden flex flex-col justify-between p-6 mx-auto"
      style={{
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.8)'
      }}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
      
      {/* Holographic Sheen Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent w-[200%] h-full -translate-x-full animate-[shimmer_5s_infinite]"></div>

      <div className="text-center z-10 mt-4">
        <div className="w-12 h-12 rounded-full border border-slate-400 mx-auto flex items-center justify-center mb-4">
          <span className="font-serif text-xl italic text-slate-600">K&M</span>
        </div>
        <h3 className="font-serif text-lg text-slate-800 tracking-wider">Eternal Proof</h3>
      </div>

      <div className="z-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">Memorial ID</p>
        <p className="font-mono text-xs text-slate-700 mb-4">{id}</p>
        <div className="h-px w-full bg-slate-400/30 mb-4"></div>
        <p className="font-serif text-sm text-slate-600">"Forever held in the K&M ERA"</p>
      </div>

      <div className="absolute bottom-0 right-0 p-2 opacity-30">
         <svg width="40" height="40" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="2" fill="none" />
         </svg>
      </div>
    </motion.div>
  );
};