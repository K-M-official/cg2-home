import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Shield, Globe } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const meteors = Array.from({ length: 15 }).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2
  }));

  return (
    <div className="w-full relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen w-full bg-[#020617] overflow-hidden flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>

        {meteors.map((m, i) => (
          <span key={i} className="absolute top-0 h-0.5 w-0.5 rounded-full bg-white rotate-[215deg] animate-meteor"
            style={{ left: `${m.left}%`, animationDelay: `${m.delay}s`, animationDuration: `${m.duration}s`, top: '-10px' }}>
            <div className="absolute top-1/2 -z-10 h-[1px] w-[80px] -translate-y-1/2 bg-gradient-to-r from-transparent to-white/40" />
          </span>
        ))}

        <div className="relative z-20 max-w-5xl mx-auto flex flex-col items-center">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-indigo-300 text-[10px] font-bold uppercase tracking-[0.3em] mb-12 animate-fade-in">
             <Sparkles className="w-3 h-3" /> Eternal Legacy Hub
           </div>

           <h1 className="text-6xl md:text-9xl font-serif text-white mb-10 leading-[0.9] tracking-tighter animate-fade-in">
             Pure Love <br/>
             <span className="italic font-light text-slate-400 text-5xl md:text-7xl">Eternal Memory</span>
           </h1>

           <p className="text-slate-400 font-light text-lg md:text-xl max-w-xl mx-auto mb-16 animate-fade-in opacity-80">
             "Let memories last forever, let people return to their original purity."
           </p>

           <div className="group relative">
              <div className="absolute -inset-1 bg-white rounded-full blur-[20px] opacity-10 group-hover:opacity-30 transition duration-1000"></div>
              <button
                onClick={() => navigate('/cloud-space')}
                className="relative px-12 py-5 bg-white text-slate-950 rounded-full leading-none flex items-center transition-all duration-500 transform group-hover:scale-105 shadow-2xl"
              >
                <span className="flex items-center gap-3 font-serif text-xl tracking-wide">
                  Enter Cloud Memory Space
                </span>
                <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </div>
      </section>

      {/* Feature Split Section */}
      <section className="bg-slate-950 py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => navigate('/gallery')}>
            <Globe className="w-10 h-10 text-indigo-400 mb-8" />
            <h3 className="text-3xl font-serif text-white mb-4">Remembrance Gallery</h3>
            <p className="text-slate-400 font-light mb-8">A public space where life stories are shared with the world, celebrating the impact of every soul.</p>
            <span className="text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Browse Public Stars</span>
          </div>

          <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => navigate('/cloud-space')}>
            <Heart className="w-10 h-10 text-rose-400 mb-8" />
            <h3 className="text-3xl font-serif text-white mb-4">Cloud Memorials</h3>
            <p className="text-slate-400 font-light mb-8">Encrypted, private sanctuaries for family and close friends. A safe haven for your most intimate memories.</p>
            <span className="text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Access Private Space</span>
          </div>

          <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => navigate('/heritage')}>
            <Shield className="w-10 h-10 text-amber-400 mb-8" />
            <h3 className="text-3xl font-serif text-white mb-4">Heritage & Tokens</h3>
            <p className="text-slate-400 font-light mb-8">Immutable blockchain-backed legacy tokens that ensure memories remain untouched by time.</p>
            <span className="text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">View Heritage Rankings</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;