import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Shield, Globe, Lock } from 'lucide-react';
import { FadeIn, SectionTitle, TechCard, Button } from '../components/UI';
import { MOCK_LEADERBOARD, MOCK_NEWS } from '../constants';
import { RWABadge } from '../components/RWABadge';

const HeritagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 pt-28 pb-12 px-6 relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionTitle title="Digital Heritage" subtitle="Preserving history through immutable tokens." light />

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
            <div className="bg-slate-800 p-1 rounded-full flex gap-1">
                <button 
                  onClick={() => setActiveTab('public')}
                  className={`px-8 py-2 rounded-full text-sm transition-all ${activeTab === 'public' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Public Leaderboard
                </button>
                <button 
                  onClick={() => setActiveTab('private')}
                  className={`px-8 py-2 rounded-full text-sm transition-all ${activeTab === 'private' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Private Tokens
                </button>
            </div>
        </div>

        {activeTab === 'public' ? (
            <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* --- LEADERBOARD COLUMN --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="text-yellow-500" />
                        <h3 className="text-xl font-serif text-white">Global Remembrance Rank</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">
                        Top 10 most visited and honored memorials this week, calculated by our <b>POM (Proof of Memory)</b> algorithm.
                    </p>

                    {MOCK_LEADERBOARD.map((entry, index) => (
                        <TechCard key={index} className="flex flex-col md:flex-row items-center gap-6 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-12 h-12 flex items-center justify-center rounded-full font-mono text-xl font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : index === 1 ? 'bg-slate-300/20 text-slate-300' : index === 2 ? 'bg-orange-700/20 text-orange-400' : 'bg-slate-800 text-slate-600'}`}>
                                    {entry.rank}
                                </div>
                                <img src={entry.memorial.coverImage} className="w-16 h-16 rounded-lg object-cover" alt="" />
                            </div>
                            
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-white font-serif text-xl">{entry.memorial.name}</h4>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-400 mt-1">
                                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{entry.memorial.type}</span>
                                    <span>ID: {entry.memorial.badgeId}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                                <div className="text-center">
                                    <div className="text-2xl font-mono text-emerald-400">{entry.pomScore}</div>
                                    <div className="text-[10px] uppercase text-slate-500">POM Score</div>
                                </div>
                                <div className="text-center w-12">
                                    {entry.change === 'up' && <TrendingUp className="text-emerald-500 mx-auto" />}
                                    {entry.change === 'down' && <TrendingDown className="text-red-500 mx-auto" />}
                                    {entry.change === 'same' && <Minus className="text-slate-600 mx-auto" />}
                                </div>
                            </div>
                        </TechCard>
                    ))}
                </div>

                {/* --- GLOBAL NEWS COLUMN --- */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Globe className="text-blue-400 animate-pulse" />
                        <h3 className="text-xl font-serif text-white">Global Pulse</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">
                        Real-time events linked to our heroes. When a life touches the world, the world remembers.
                    </p>

                    <div className="space-y-4">
                        {MOCK_NEWS.map((item) => (
                            <TechCard key={item.id} className="border-l-4 border-l-red-500">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">{item.category}</span>
                                    <span className="text-[10px] text-slate-500">{item.date}</span>
                                </div>
                                <h5 className="text-white font-serif leading-tight mb-2 hover:text-blue-300 cursor-pointer transition-colors">{item.title}</h5>
                                <p className="text-slate-400 text-xs leading-relaxed">{item.summary}</p>
                                {item.relatedMemorialId && (
                                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                        <span className="text-[10px] text-slate-300">Linked to Rank #{MOCK_LEADERBOARD.find(m => m.memorial.id === item.relatedMemorialId)?.rank}</span>
                                    </div>
                                )}
                            </TechCard>
                        ))}
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-900/40 to-slate-800/40 border border-blue-500/20 text-center mt-8">
                        <Shield className="mx-auto text-blue-400 mb-4" size={32} />
                        <h4 className="text-white font-serif mb-2">Honor Life</h4>
                        <p className="text-xs text-slate-400 mb-4">
                            These rankings are not just numbers. They remind us of the sacrifices made daily by heroes around the globe.
                        </p>
                    </div>
                </div>
            </div>
        ) : (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                <div className="mb-12">
                    <Lock className="mx-auto text-slate-500 mb-4" size={48} />
                    <h3 className="text-3xl font-serif text-white mb-4">Private Heritage Tokens</h3>
                    <p className="text-slate-400 font-light leading-relaxed">
                        For every private Cloud Memorial, we mint a unique, non-transferable token (SBT). 
                        This token serves as the eternal key to the memorial, ensuring that the data persists on the blockchain forever, 
                        accessible only to those who hold the key or are granted access.
                    </p>
                </div>

                <div className="flex justify-center mb-12">
                   <div className="scale-110">
                        <RWABadge id="PRIVATE-KEY-SAMPLE" name="Your Loved One" />
                   </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 text-left">
                     <TechCard title="Immutable">
                        <p className="text-xs text-slate-400">Once minted, the core memorial data cannot be altered by third parties.</p>
                     </TechCard>
                     <TechCard title="Decentralized">
                        <p className="text-xs text-slate-400">Storage is distributed across the weave, ensuring no single point of failure.</p>
                     </TechCard>
                     <TechCard title="Emotional Value">
                        <p className="text-xs text-slate-400">Not a financial asset, but a vessel for emotional capital.</p>
                     </TechCard>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default HeritagePage;
