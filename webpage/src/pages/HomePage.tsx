import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cloud, Hexagon, Globe, Sparkles, ChevronDown, ShieldCheck, Star, User, Dog } from 'lucide-react';
import { useLeaderboard } from '../hooks/useLeaderboard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { leaderboard, loading } = useLeaderboard(3);

  const scrollToNext = () => {
    const nextSection = document.getElementById('cloud-memorial');
    if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
  };

  const galleryCategories = [
    { 
      id: 'hero', 
      label: 'Heroes', 
      icon: <ShieldCheck className="w-6 h-6" />, 
      image: 'https://images.unsplash.com/photo-1617112837937-3d9d33cb42e5?q=80&w=2070&auto=format&fit=crop',
      desc: 'Firefighters, soldiers, and saviors.'
    },
    { 
      id: 'celebrity', 
      label: 'Public Figures', 
      icon: <Star className="w-6 h-6" />, 
      image: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?q=80&w=2070&auto=format&fit=crop',
      desc: 'Scientists, artists, and leaders.'
    },
    { 
      id: 'civilian', 
      label: 'Civilians', 
      icon: <User className="w-6 h-6" />, 
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop',
      desc: 'Everyday people, extraordinary lives.'
    },
    { 
      id: 'pet', 
      label: 'Pets', 
      icon: <Dog className="w-6 h-6" />, 
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop',
      desc: 'Our eternal loyal companions.'
    },
  ];

  return (
    <div className="w-full relative overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center px-6">
        {/* Content */}
        <div className="relative z-20 max-w-5xl mx-auto flex flex-col items-center">
           <h1 className="text-5xl lg:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400 mb-8 leading-tight tracking-tight animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
             Death is not the end <br/>
             <span className="italic font-light text-slate-400">forgetting is</span>
           </h1>

           <p className="text-slate-400 font-light text-lg lg:text-xl max-w-xl mx-auto mb-16 animate-fade-in opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
             Let memories exist eternally in the digital cosmos.
           </p>

           {/* White Glowing Button */}
           <div className="group relative animate-fade-in opacity-0" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
              <div className="absolute -inset-1 bg-white rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <button 
                onClick={() => navigate('/create')}
                className="relative px-12 py-4 bg-white rounded-full leading-none flex items-center divide-x divide-slate-200 transition-all duration-300 transform group-hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.7)] group-hover:shadow-[0_0_60px_-15px_rgba(255,255,255,1)]"
              >
                <span className="flex items-center gap-2 text-slate-900 font-serif text-lg tracking-wide pr-6">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Create Cloud Memorial
                </span>
                <span className="pl-6 text-indigo-600 group-hover:text-indigo-800 transition duration-200 text-sm font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 absolute right-8 group-hover:right-6 group-hover:translate-x-0 translate-x-4">
                  Start Now
                </span>
              </button>
           </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          onClick={scrollToNext}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 hover:text-white cursor-pointer transition-colors animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </div>
      </section>

      {/* 2. CLOUD MEMORIAL SECTION */}
      <section id="cloud-memorial" className="min-h-[85vh] w-full bg-white flex items-center py-20">
         <div className="max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center gap-16">
            
            <div className="w-full lg:w-1/2 relative">
               <div className="aspect-[4/5] rounded-3xl overflow-hidden relative shadow-2xl">
                 <img 
                   src="https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=2670&auto=format&fit=crop" 
                   alt="Private Memory" 
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                 <div className="absolute bottom-8 left-8 text-white">
                   <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full inline-flex items-center gap-2 mb-3">
                     <Cloud className="w-4 h-4 text-white" />
                     <span className="text-xs font-medium uppercase tracking-wider">Private & Encrypted</span>
                   </div>
                   <p className="font-serif italic text-lg opacity-90">"A sanctuary just for us."</p>
                 </div>
               </div>
               {/* Decoration */}
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl -z-10"></div>
            </div>

            <div className="w-full lg:w-1/2">
               <h2 className="text-4xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
                 Cloud Memorial
               </h2>
               <p className="text-slate-500 text-lg font-light leading-relaxed mb-8">
                 A private digital space to preserve the essence of your loved ones. Upload photos, write letters, and light virtual candles in a secure, tender environment. 
               </p>
               <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><ShieldCheck className="w-5 h-5"/></div>
                    <div>
                      <h4 className="font-serif text-slate-800">Private Heritage Token</h4>
                      <p className="text-xs text-slate-400">Minted exclusively for family members.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><Sparkles className="w-5 h-5"/></div>
                    <div>
                      <h4 className="font-serif text-slate-800">AI Biography</h4>
                      <p className="text-xs text-slate-400">Let Gemini write a poetic tribute.</p>
                    </div>
                  </div>
               </div>
               <div className="mt-10">
                 <button 
                   onClick={() => navigate('/create')}
                   className="text-slate-900 font-medium border-b border-slate-900 pb-1 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2"
                 >
                   Start a Private Memorial <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
            </div>
         </div>
      </section>

      {/* 3. REMEMBRANCE GALLERY SECTION */}
      <section className="min-h-screen w-full bg-slate-50 py-24 flex flex-col justify-center">
         <div className="max-w-7xl mx-auto px-6 w-full mb-12 text-center lg:text-left flex flex-col lg:flex-row justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                 <Globe className="w-5 h-5 text-indigo-600" />
                 <span className="text-sm font-bold uppercase tracking-widest text-indigo-900">Public Community</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-serif text-slate-900 mb-4">
                Remembrance Gallery
              </h2>
              <p className="text-slate-500 max-w-xl text-lg font-light">
                Honor the world's souls. Upload a tribute, share stories, and celebrate lives in our public community space.
              </p>
            </div>
            <button 
              onClick={() => navigate('/gallery')}
              className="hidden lg:flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
            >
              Enter Gallery <ArrowRight className="w-4 h-4" />
            </button>
         </div>

         {/* 4 Cards Grid */}
         <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-4 gap-4 h-[600px] lg:h-[500px]">
            {galleryCategories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => navigate('/gallery')}
                className="relative group overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 ease-out lg:hover:w-[140%] lg:w-full"
              >
                <img 
                  src={cat.image} 
                  alt={cat.label} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/30 transition-colors duration-500"></div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between items-center text-center group-hover:items-start group-hover:text-left transition-all">
                   <div className="mt-10 p-4 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20 group-hover:scale-110 transition-transform">
                     {cat.icon}
                   </div>
                   
                   <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                     <h3 className="text-2xl font-serif text-white mb-2">{cat.label}</h3>
                     <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 max-w-[200px]">
                       {cat.desc}
                     </p>
                     <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                        <span className="text-xs text-white border-b border-white pb-0.5">Explore {cat.label}</span>
                     </div>
                   </div>
                </div>
              </div>
            ))}
         </div>
         
         <div className="mt-8 text-center lg:hidden">
            <button 
              onClick={() => navigate('/gallery')}
              className="px-8 py-3 bg-slate-900 text-white rounded-full"
            >
              Enter Gallery
            </button>
         </div>
      </section>

      {/* 4. HERITAGE TOKENS SECTION (With Leaderboard Data) */}
      <section className="min-h-[70vh] w-full bg-[#0B1120] text-white flex items-center relative overflow-hidden">
         {/* Background Tech Elements */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="absolute bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
            <div className="w-full lg:w-1/2">
               <div className="flex items-center gap-3 mb-8 text-indigo-400">
                  <Hexagon className="w-6 h-6" />
                  <span className="text-sm font-bold uppercase tracking-widest">Web3 Integration</span>
               </div>
               <h2 className="text-4xl lg:text-6xl font-serif text-white mb-6 leading-tight">
                 Heritage Tokens
               </h2>
               <p className="text-slate-400 text-lg font-light leading-relaxed mb-10 max-w-lg">
                 Immutable proof of existence. See who has been selected for the Public Heritage Token via our PoM Leaderboard.
               </p>
               
               <div className="flex flex-col max-lg:flex-row gap-6">
                 <button 
                   onClick={() => navigate('/tokens')}
                   className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                 >
                   View Leaderboard <ArrowRight className="w-4 h-4" />
                 </button>
                 <button className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/5 text-white rounded-lg transition-all">
                   View Contract
                 </button>
               </div>
            </div>

            {/* Leaderboard Data Display (Replaces Abstract Graphic) */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
               <div className="relative w-full max-w-md space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Live Ranking (POM Score)
                  </h3>
                  
                  {loading ? (
                    <div className="animate-pulse space-y-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-20 bg-slate-800/50 rounded-xl"></div>
                      ))}
                    </div>
                  ) : leaderboard.length > 0 ? (
                    leaderboard.map((entry, i) => (
                      <div 
                        key={i}
                        className="group relative flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800/80 transition-all backdrop-blur-sm"
                      >
                         <div className="font-mono text-2xl text-indigo-400/80 w-8 font-bold">0{entry.rank}</div>
                         <img src={entry.memorial.coverImage} className="w-12 h-12 rounded-lg object-cover border border-white/10" alt="" />
                         <div className="flex-1">
                            <h4 className="text-white font-serif text-lg">{entry.memorial.name}</h4>
                            <p className="text-slate-400 text-xs">{entry.memorial.type} • {entry.memorial.badgeId}</p>
                         </div>
                         <div className="text-right">
                            <div className="text-emerald-400 font-mono text-lg">{entry.pomScore}</div>
                            <div className="text-slate-600 text-[10px] uppercase">Score</div>
                         </div>
                         {/* Glow Effect */}
                         <div className="absolute inset-0 rounded-xl bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500 border border-slate-800 rounded-xl">
                       No active rankings.
                    </div>
                  )}
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};

export default HomePage;