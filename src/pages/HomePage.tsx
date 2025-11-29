import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Heart, Cloud, Globe, Hash } from 'lucide-react';
import { FadeIn, Button, SectionTitle, Card, TechCard } from '../components/UI';
import { ShootingStars } from '../components/ShootingStars';
import { MOCK_NEWS } from '../constants';
import { useLeaderboard } from '../hooks/useLeaderboard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { leaderboard, loading, error } = useLeaderboard(3);

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Deep Space Background with Shooting Stars */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-0" />
        <ShootingStars />
        
        {/* Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-20">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-blue-200 font-mono mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              K&M ERA PROTOCOL V1.0 LIVE
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight mb-8 drop-shadow-2xl">
              Let memories last forever,<br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-lavender-200 to-blue-200 text-4xl md:text-6xl">
                Return to original purity.
              </span>
            </h1>
            
            <p className="text-slate-300 text-lg font-light max-w-2xl mx-auto mb-12 leading-relaxed">
              The first Tender-Tech ecosystem combining <b>Cloud Memorials</b>, a <b>Public Remembrance Gallery</b>, and <b>Commemorative Digital Heritage Tokens (CDHT)</b>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/create')} className="bg-white text-slate-900 px-8 hover:bg-lavender-50">
                Create Cloud Memorial
              </Button>
              <Button variant="glass" onClick={() => navigate('/heritage')}>
                View Heritage Tokens
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- PRODUCT LINE 1: CLOUD MEMORIAL --- */}
      <section className="py-24 px-6 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
           <FadeIn>
              <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full opacity-30 blur-2xl"></div>
                  <img 
                    src="https://picsum.photos/600/600?random=1" 
                    alt="Cloud Memorial" 
                    className="relative rounded-2xl shadow-2xl z-10" 
                  />
                  {/* Floating UI Elements */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -right-8 top-12 bg-white p-4 rounded-xl shadow-lg z-20 max-w-[200px]"
                  >
                     <div className="flex items-center gap-2 mb-2">
                        <Star className="text-yellow-400" size={16} fill="currentColor" />
                        <span className="text-xs font-bold text-slate-700">Forever Lit</span>
                     </div>
                     <p className="text-xs text-slate-500">"Your light never fades here..."</p>
                  </motion.div>
              </div>
           </FadeIn>
           <FadeIn delay={0.2}>
              <div className="flex items-center gap-2 mb-4">
                 <Cloud className="text-slate-400" size={20} />
                 <span className="uppercase text-xs tracking-widest text-slate-500">Product Line 01</span>
              </div>
              <h2 className="font-serif text-4xl text-slate-800 mb-6">Cloud Memorial Space</h2>
              <p className="text-slate-600 leading-loose font-light mb-8">
                A private, immersive sanctuary for your loved ones. Customize the atmosphere with our Tender-Tech aesthetic, upload memories, and perform digital rituals like lighting candles or leaving whispers.
              </p>
              <Button variant="secondary" onClick={() => navigate('/create')}>Start a Memorial →</Button>
           </FadeIn>
        </div>
      </section>

      {/* --- PRODUCT LINE 2: REMEMBRANCE GALLERY --- */}
      <section className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
             <div className="flex items-center justify-center gap-2 mb-4">
                 <Globe className="text-slate-400" size={20} />
                 <span className="uppercase text-xs tracking-widest text-slate-500">Product Line 02</span>
              </div>
              <h2 className="font-serif text-4xl text-slate-800 mb-6">Remembrance Gallery</h2>
              <p className="text-slate-500">
                A public hall of fame for humanity. From heroes and scientists to beloved pets, we categorize and honor those who made the world brighter.
              </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {['Heroes', 'Scientists', 'Civilians', 'Pets'].map((cat, i) => (
                <FadeIn key={cat} delay={i * 0.1}>
                   <div 
                     onClick={() => navigate('/gallery')}
                     className="group cursor-pointer aspect-square rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-800 hover:text-white transition-all duration-500 relative overflow-hidden"
                   >
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="font-serif text-2xl mb-2">{cat}</span>
                      <span className="text-xs uppercase tracking-widest opacity-50">View Section</span>
                   </div>
                </FadeIn>
             ))}
          </div>
        </div>
      </section>

      {/* --- PRODUCT LINE 3: CDHT & NEWS --- */}
      <section className="py-24 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-900/10 blur-3xl"></div>

        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Hash className="text-blue-400" size={20} />
                    <span className="uppercase text-xs tracking-widest text-blue-200">Product Line 03</span>
                  </div>
                  <h2 className="font-serif text-4xl text-white mb-2">Heritage Tokens & Pulse</h2>
                  <p className="text-slate-400 max-w-lg">
                    Immutable on-chain proof of existence. Private tokens for personal memorials, and public rankings driven by our POM (Proof of Memory) algorithm.
                  </p>
              </div>
              <Button variant="glass" className="mt-6 md:mt-0" onClick={() => navigate('/heritage')}>
                  Explore Global Pulse →
              </Button>
           </div>

           <div className="grid lg:grid-cols-3 gap-8">
              {/* Leaderboard Preview */}
              <div className="lg:col-span-2 space-y-4">
                 <div className="flex items-center justify-between text-white/50 text-xs uppercase tracking-widest mb-2 px-2">
                    <span>Weekly Top Remembered</span>
                    <span>POM Algorithm</span>
                 </div>
                 {loading ? (
                   <div className="text-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                     <p className="text-white/50 text-sm mt-4">加载中...</p>
                   </div>
                 ) : error ? (
                   <div className="text-center py-8">
                     <p className="text-red-400 text-sm">加载失败: {error}</p>
                   </div>
                 ) : leaderboard.length === 0 ? (
                   <div className="text-center py-8">
                     <p className="text-white/50 text-sm">暂无数据</p>
                   </div>
                 ) : (
                   leaderboard.map((entry, i) => (
                     <FadeIn key={i} delay={i * 0.1}>
                       <TechCard className="flex items-center gap-6 group hover:bg-white/5 transition-colors">
                          <div className="font-mono text-2xl text-blue-300 w-8">0{entry.rank}</div>
                          <img src={entry.memorial.coverImage} className="w-12 h-12 rounded-full object-cover border border-white/20" alt="" />
                          <div className="flex-1">
                             <h4 className="text-white font-serif text-lg">{entry.memorial.name}</h4>
                             <p className="text-slate-400 text-xs">{entry.memorial.type} • {entry.memorial.badgeId}</p>
                          </div>
                          <div className="text-right">
                             <div className="text-emerald-400 font-mono text-lg">{entry.pomScore}</div>
                             <div className="text-slate-500 text-[10px] uppercase">POM Score</div>
                          </div>
                       </TechCard>
                     </FadeIn>
                   ))
                 )}
              </div>

              {/* News Ticker Preview */}
              <div className="lg:col-span-1">
                  <div className="flex items-center justify-between text-white/50 text-xs uppercase tracking-widest mb-6 px-2">
                    <span>Global Context</span>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                 </div>
                 <div className="space-y-4">
                    {MOCK_NEWS.map((news, i) => (
                       <FadeIn key={i} delay={0.3 + (i * 0.1)}>
                          <div className="p-4 rounded-xl bg-white/5 border-l-2 border-red-500 backdrop-blur-sm">
                             <span className="text-[10px] bg-red-500/20 text-red-200 px-2 py-0.5 rounded-full mb-2 inline-block">
                                {news.category}
                             </span>
                             <h5 className="text-white font-serif text-sm mb-2">{news.title}</h5>
                             <p className="text-slate-400 text-xs line-clamp-2">{news.summary}</p>
                          </div>
                       </FadeIn>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
