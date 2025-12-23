import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon, Lock, Globe, ArrowRight, Shield, Zap, Sparkles, ShieldCheck, ArrowUpRight, Trophy, Newspaper } from 'lucide-react';
import { useLeaderboard } from '../hooks/useLeaderboard';

export const HeritagePage: React.FC = () => {
  const navigate = useNavigate();
  const { leaderboard, loading } = useLeaderboard(10);

  // Helper to get styling based on rank
  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border-yellow-200 shadow-[0_0_20px_rgba(251,191,36,0.6)]";
    if (rank === 2) return "bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 border-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.4)]";
    if (rank === 3) return "bg-gradient-to-r from-orange-200 to-amber-700 text-amber-100 border-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.4)]";
    return "bg-slate-800 text-slate-400 border-slate-700";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pt-24 pb-20 overflow-hidden relative">
      
      {/* Background Ambience with Tech Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
        
        {/* Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* 1. HEADER */}
      <div className="max-w-5xl mx-auto px-6 text-center mb-20 relative z-10">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-md text-indigo-400 mb-8 shadow-lg animate-fade-in">
          <Hexagon className="w-3.5 h-3.5" />
          <span className="text-xs font-bold tracking-[0.2em] uppercase">Immutable Heritage</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-serif text-white mb-6 leading-tight drop-shadow-2xl animate-fade-in" style={{animationDelay: '0.1s'}}>
          Eternal <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-white">Proof</span> of Existence
        </h1>
        <p className="text-lg lg:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
          Blockchain-backed heritage tokens ensuring memories withstand the test of time. 
          Bridging the gap between personal grief and global remembrance.
        </p>
      </div>

      {/* 2. TOKEN TYPES SPLIT */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-32 relative z-10 animate-fade-in" style={{animationDelay: '0.3s'}}>
        
        {/* Private Token Card */}
        <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:bg-slate-800/40 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
               <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-inner group-hover:scale-105 transition-transform">
                 <Lock className="w-8 h-8 text-indigo-400" />
               </div>
               <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-emerald-500/20">
                 Minted on Creation
               </div>
            </div>
            
            <h3 className="text-3xl font-serif text-white mb-4">Private Heritage Token</h3>
            <p className="text-slate-400 leading-relaxed mb-8 min-h-[80px]">
              The encrypted key to a personal Cloud Memorial. Ensures that intimate memories remain accessible only to family, secured forever on the decentralized web.
            </p>

            <button onClick={() => navigate('/create')} className="w-full py-4 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-medium transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              Create Private Memorial <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Public Token Card */}
        <div className="group relative bg-gradient-to-b from-indigo-950/30 to-slate-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 hover:border-indigo-500/40 transition-all duration-500 overflow-hidden shadow-[0_0_40px_-10px_rgba(79,70,229,0.1)]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all duration-700"></div>

           <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
               <div className="p-4 bg-indigo-900/50 rounded-2xl border border-indigo-700/50 shadow-inner group-hover:scale-105 transition-transform">
                 <Globe className="w-8 h-8 text-white" />
               </div>
               <div className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-amber-500/20 flex items-center gap-1">
                 <Sparkles className="w-3 h-3" /> Rare Item
               </div>
            </div>
            
            <h3 className="text-3xl font-serif text-white mb-4">Public Heritage Token</h3>
            <p className="text-slate-300 leading-relaxed mb-8 min-h-[80px]">
              Awarded to souls who impact the world. Issued based on the PoM Algorithm which analyzes community tributes and global news relevance.
            </p>

            <button onClick={() => {
                const leaderboardEl = document.getElementById('pom-leaderboard');
                if (leaderboardEl) leaderboardEl.scrollIntoView({ behavior: 'smooth' });
            }} className="w-full py-4 rounded-xl bg-white text-indigo-950 font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-white/20">
              View PoM Rankings <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. PoM LEADERBOARD SECTION */}
      <div id="pom-leaderboard" className="max-w-7xl mx-auto px-6 relative z-10 animate-fade-in" style={{animationDelay: '0.4s'}}>
        
        {/* Section Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 border-b border-slate-800 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
               <Zap className="w-4 h-4 fill-indigo-400" />
               <span className="text-xs font-bold uppercase tracking-widest">Live Algorithm Data</span>
            </div>
            <h2 className="text-4xl font-serif text-white">PoM Leaderboard</h2>
          </div>
          <div className="text-right">
             <div className="text-sm text-slate-500 mb-1">Current Cycle</div>
             <div className="text-xl font-mono text-white">Week 42 • 2024</div>
          </div>
        </div>

        {/* VISUAL IDENTIFIERS FOR COLUMNS - Enhanced */}
        <div className="hidden lg:grid grid-cols-12 gap-6 mb-6 px-4">
           <div className="col-span-1"></div>
           
           {/* Person Identifier Badge */}
           <div className="col-span-4 relative group">
              <div className="absolute inset-0 bg-amber-500/10 rounded-lg blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-amber-900/30">
                <div className="bg-amber-500/20 p-2.5 rounded-lg border border-amber-500/20">
                    <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                    <div className="text-sm text-amber-100 font-bold uppercase tracking-wider">The Honored</div>
                    <div className="text-[10px] text-amber-400/60">Ranked by Proof of Memory</div>
                </div>
              </div>
           </div>

           <div className="col-span-2 flex flex-col items-center justify-center">
             <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Calculated Via</div>
             <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
           </div>

           <div className="col-span-1"></div>
           
           {/* News Identifier Badge */}
           <div className="col-span-4 relative group">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-lg blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-indigo-900/30">
                <div className="bg-indigo-500/20 p-2.5 rounded-lg border border-indigo-500/20">
                    <Newspaper className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <div className="text-sm text-indigo-100 font-bold uppercase tracking-wider">Global Context</div>
                    <div className="text-[10px] text-indigo-400/60">Real-time Event Verification</div>
                </div>
              </div>
           </div>
        </div>


        {/* Leaderboard Table */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl">
           
           {/* List */}
           <div className="divide-y divide-slate-800/50">
             {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                </div>
             ) : leaderboard.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No ranking data available.</div>
             ) : (
                 leaderboard.map((item, idx) => (
                   <div key={item.rank || idx} className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 items-center hover:bg-white/5 transition-colors group relative">
                      
                      {/* Rank */}
                      <div className="col-span-1 flex justify-center">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-serif font-bold text-xl transition-all duration-500 ${getRankStyle(idx + 1)}`}>
                          {idx + 1}
                        </div>
                      </div>

                      {/* Soul Info */}
                      <div className="col-span-4 flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/memorial/${item.memorial.id}`)}>
                         <div className="relative">
                           <img src={item.memorial.coverImage} alt={item.memorial.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-700 group-hover:ring-indigo-500 transition-all shadow-lg" />
                           {idx < 3 && (
                             <div className="absolute -top-1 -right-1 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                               <Sparkles className="w-5 h-5 fill-amber-400 animate-pulse-slow" />
                             </div>
                           )}
                         </div>
                         <div>
                           <h4 className="font-serif font-medium text-white text-xl group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                             {item.memorial.name}
                           </h4>
                           <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="capitalize px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-medium">{item.memorial.type}</span>
                              <span className="font-mono opacity-40">{item.memorial.badgeId}</span>
                           </div>
                         </div>
                      </div>

                      {/* PoM Score */}
                      <div className="col-span-2 text-center relative group/score">
                          <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1 opacity-0 group-hover/score:opacity-100 transition-opacity absolute -top-4 w-full text-center">PoM Score</div>
                          <div className="font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 text-2xl">{Math.floor(item.pomScore).toLocaleString()}</div>
                          <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-400" style={{ width: `${Math.min((item.pomScore / 12000) * 100, 100)}%` }}></div>
                          </div>
                      </div>

                      {/* Token Icon */}
                      <div className="col-span-1 flex justify-center">
                          <div className="p-2 rounded-full bg-slate-800/50 group-hover:bg-amber-500/10 transition-colors">
                            <ShieldCheck className={`w-6 h-6 ${idx < 3 ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-600'}`} />
                          </div>
                      </div>

                      {/* News Context (Mocked for now as API doesn't return news in this view) */}
                      <div className="col-span-4 pl-6 border-l border-slate-800 relative">
                         {/* Connector Line */}
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-8 bg-indigo-500/20 rounded-full hidden lg:block"></div>
                         
                         {idx % 2 === 0 ? (
                          <div className="group/news cursor-pointer">
                            <div className="flex items-center gap-2 mb-1.5">
                               <Globe className="w-3.5 h-3.5 text-indigo-400" />
                               <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-900/30 border border-indigo-800/50">Global News</span>
                               <span className="text-[10px] text-slate-500">2h ago</span>
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-snug group-hover/news:text-white transition-colors flex items-center gap-2">
                                Memorial service attended by thousands worldwide.
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover/news:opacity-100 transition-opacity text-indigo-400"/>
                            </p>
                          </div>
                        ) : (
                          <div className="text-slate-700 text-sm italic flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                            No significant global event correlation.
                          </div>
                        )}
                      </div>
                   </div>
                 ))
             )}
           </div>
        </div>
        
        <div className="mt-8 text-center">
          <button className="text-slate-500 hover:text-white transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-white/50 pb-1">
            View Immutable Historical Ledger
          </button>
        </div>

      </div>

    </div>
  );
};

export default HeritagePage;
