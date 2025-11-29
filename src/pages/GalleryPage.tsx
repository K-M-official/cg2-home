import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Flame, Flower, ChevronRight } from 'lucide-react';
import { FadeIn, SectionTitle, Card, Button } from '../components/UI';
import { MOCK_MEMORIALS } from '../constants';
import { MemorialType } from '../types';

const CATEGORIES = [
  { label: 'All', value: 'All' },
  { label: 'Heroes', value: MemorialType.HERO },
  { label: 'Scientists', value: MemorialType.SCIENTIST },
  { label: 'Civilians', value: MemorialType.CIVILIAN },
  { label: 'Pets', value: MemorialType.PET },
];

const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' 
    ? MOCK_MEMORIALS 
    : MOCK_MEMORIALS.filter(m => m.type === filter);

  // Duplicate data to demonstrate the "Scrolling Screen" effect (Infinite Scroll feel)
  // In a real app, this would be handled by pagination or infinite loading.
  const displayItems = [...filtered, ...filtered, ...filtered].map((item, index) => ({
      ...item,
      uniqueKey: `${item.id}-${index}`
  }));

  return (
    <div className="min-h-screen pt-28 pb-12 px-0 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
            <div className="mb-6 md:mb-0">
                <SectionTitle title="Remembrance Gallery" subtitle="Echoes of beautiful lives, categorized by their impact." />
            </div>
            <div className="mb-12">
                <Button onClick={() => navigate('/create')} className="bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200">
                    <Plus size={18} />
                    Create Public Memorial
                </Button>
            </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sticky left-6 right-6 z-20">
            
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar mask-gradient">
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat.label}
                        onClick={() => setFilter(cat.value)}
                        className={`px-6 py-2.5 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${filter === cat.value ? 'bg-slate-800 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="w-full md:w-80 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:border-slate-400 bg-slate-50 text-sm transition-all focus:bg-white"
                    placeholder="Search for a memory..."
                />
            </div>
        </div>
      </div>

      {/* Horizontal Scroll Container (The "Scrolling Screen") */}
      <div className="relative w-full">
         {/* Fade Masks for Scroll Indication */}
         <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none"></div>
         <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none"></div>

         <div className="overflow-x-auto pb-16 pt-4 px-6 md:px-12 flex gap-6 snap-x snap-mandatory scroll-smooth hide-scrollbar">
            {displayItems.map((memorial, index) => (
               <div key={memorial.uniqueKey} className="snap-center shrink-0">
                 <FadeIn delay={index * 0.05}>
                    <Card className="w-[300px] md:w-[380px] h-[500px] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col p-0 overflow-hidden group border-0 relative bg-white rounded-3xl" >
                         <div 
                           className="h-3/5 overflow-hidden relative"
                           onClick={() => navigate(`/memorial/${memorial.id}`)}
                         >
                            <img src={memorial.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={memorial.name} />
                            
                            {/* Type Badge */}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold text-slate-800 shadow-sm border border-white/50">
                                {memorial.type}
                            </div>

                             <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent pt-24">
                                 <h3 className="text-white font-serif text-2xl mb-1 shadow-black drop-shadow-md">{memorial.name}</h3>
                                 <p className="text-white/80 text-xs uppercase tracking-widest font-mono">{memorial.dates}</p>
                             </div>
                         </div>
                         
                         <div className="p-6 flex-1 flex flex-col justify-between relative bg-white/40 backdrop-blur-xl">
                             <div className="absolute top-0 right-6 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100 z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                <ChevronRight size={20} />
                             </div>

                             <p className="text-slate-600 font-light text-sm line-clamp-3 leading-relaxed pt-2">{memorial.bio}</p>
                             
                             <div className="mt-4 pt-4 border-t border-slate-100">
                                {/* Interaction Stats */}
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                                            <Flame size={14} className="text-orange-500" fill="currentColor" />
                                            <span className="text-xs font-bold text-slate-700">{memorial.stats.candles}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-pink-50 px-2 py-1 rounded-md border border-pink-100">
                                            <Flower size={14} className="text-pink-500" fill="currentColor" />
                                            <span className="text-xs font-bold text-slate-700">{memorial.stats.flowers}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase text-slate-400">POM Score</div>
                                        <div className="font-mono text-sm text-emerald-600 font-bold">{memorial.pomScore}</div>
                                    </div>
                                </div>
                             </div>
                         </div>
                    </Card>
                 </FadeIn>
               </div>
            ))}
            
            {/* End Spacer */}
            <div className="w-12 shrink-0"></div>
         </div>
      </div>
      
      {/* Scroll Hint */}
      <div className="text-center text-slate-400 text-xs animate-pulse mt-4">
          Swipe to explore memories
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;