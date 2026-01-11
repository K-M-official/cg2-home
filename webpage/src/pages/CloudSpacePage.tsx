import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart } from 'lucide-react';
import { GalaxyMap } from '../components/GalaxyMap';

const CloudSpacePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#020617] pb-20 px-6 overflow-hidden">
      {/* Soft Romantic Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-900/10 blur-[150px] rounded-full"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto mb-16 pt-32 flex flex-col md:flex-row justify-between items-end gap-10 relative z-10">
        <div className="text-left w-full md:max-w-3xl">
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] mb-8 border border-white/10 text-rose-300 shadow-xl">
             <Heart className="w-3.5 h-3.5 fill-rose-400 animate-pulse-slow" /> Eternal Connection Layer
          </div>

          <h1 className="text-6xl md:text-8xl font-serif text-white tracking-tighter leading-tight">
            Galaxy <span className="text-slate-600 italic font-light">of</span> Souls
          </h1>
        </div>

        <div className="flex flex-col items-end pb-2">
          <button
            onClick={() => navigate('/create')}
            className="px-10 py-5 bg-white text-slate-950 rounded-full font-bold transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(251,113,133,0.3)] hover:scale-105 active:scale-95 group relative whitespace-nowrap overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-200/0 via-rose-400/20 to-rose-200/0 animate-pulse-slow opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700 relative z-10" />
            <span className="font-serif text-xl relative z-10 tracking-tight">Ignite a Legacy</span>
            <div className="absolute -inset-1 bg-rose-400/20 blur-2xl opacity-40 group-hover:opacity-100 transition-opacity rounded-full animate-pulse-slow"></div>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative group z-10">
        <GalaxyMap onSelectStar={(id) => navigate(`/memorial/cosmic-space`)} />
      </div>

      {/* Bottom Features */}
      <div className="max-w-7xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        {[
          { label: 'Eternity', val: 'Forever Lit', desc: 'A star that never sets' },
          { label: 'Purity', val: 'Diamond Core', desc: 'The essence of a soul' },
          { label: 'Sanctuary', val: 'Endless Peace', desc: 'Silent cosmic refuge' },
          { label: 'Harmony', val: 'Soul Resonance', desc: 'Connected by love' },
        ].map((feat, i) => (
          <div key={i} className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl group hover:bg-white/5 transition-all duration-700 hover:-translate-y-2">
            <span className="text-rose-400/60 text-[10px] font-bold uppercase tracking-[0.3em] block mb-3">{feat.label}</span>
            <div className="text-white font-serif text-2xl mb-2">{feat.val}</div>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-light">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CloudSpacePage;
