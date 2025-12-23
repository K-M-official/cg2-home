import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Bone, Flower2, Flame, Share2, Heart, Users } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';

const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { groups, items, activeGroupId, setActiveGroupId, loadingGroups, loadingItems } = useGallery();

  // Sync URL params with activeGroupId
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    
    if (!loadingGroups) {
        if (categoryParam) {
            if (categoryParam === 'All') {
                 if (activeGroupId !== 'All') setActiveGroupId('All');
            } else {
                 // Try to find group by title first
                 const foundGroup = groups.find(g => g.title === categoryParam);
                 if (foundGroup) {
                     if (activeGroupId !== foundGroup.id) setActiveGroupId(foundGroup.id);
                 } else {
                     // If not found by title, try by ID (backward compatibility)
                     const numId = parseInt(categoryParam);
                     if (!isNaN(numId)) {
                         if (activeGroupId !== numId) setActiveGroupId(numId);
                     } else if (activeGroupId !== 'All') {
                         // Invalid param, reset to All
                         setActiveGroupId('All');
                     }
                 }
            }
        } else {
            // No param, ensure default state is consistent
             if (activeGroupId !== 'All') setActiveGroupId('All');
        }
    }
  }, [searchParams, groups, loadingGroups]);

  const handleCategoryClick = (id: number | 'All', title: string) => {
      setActiveGroupId(id);
      if (id === 'All') {
          setSearchParams({}); 
      } else {
          setSearchParams({ category: title });
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-6">
      
      {/* 1. HERO HEADER */}
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-indigo-100">
           <Users className="w-4 h-4" /> Global Commemorative Community
        </div>
        <h1 className="text-4xl lg:text-6xl font-serif text-slate-900 mb-6">
          Remembrance Gallery
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
          A public sanctuary to honor the lives of heroes, loved ones, and cherished pets. 
          Explore tributes, light candles, and share memories in an eternal digital space.
        </p>
      </div>

      {/* 2. EXPLORE & FILTER */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6 border-b border-slate-200 pb-6">
          <h2 className="text-2xl font-serif text-slate-900 flex items-center gap-2">
            Explore Tributes
          </h2>
          
          <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
            {/* All Button */}
            <button
              onClick={() => handleCategoryClick('All', 'All')}
              disabled={loadingItems}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeGroupId === 'All'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Souls
            </button>

            {/* Dynamic Groups */}
            {loadingGroups ? (
                <span className="text-slate-400 text-xs self-center px-4">Loading...</span>
            ) : (
                groups.map((group) => (
                    <button
                        key={group.id}
                        onClick={() => handleCategoryClick(group.id, group.title)}
                        disabled={loadingItems}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                            activeGroupId === group.id
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {group.title}
                    </button>
                ))
            )}
          </div>

          <div className="relative w-full lg:w-auto">
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="pl-9 pr-4 py-2 rounded-full bg-white border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 w-full lg:w-64"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* 3. GRID LAYOUT */}
        <div className="grid grid-cols-1 max-lg:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Create New Card */}
          <div 
            onClick={() => navigate('/create')}
            className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer group min-h-[380px]"
          >
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-indigo-500">
               <Plus className="w-8 h-8" />
             </div>
             <h3 className="font-serif text-lg text-slate-700">Create Public Tribute</h3>
             <p className="text-sm text-slate-500 text-center mt-2 px-4 leading-relaxed">
               Honor a hero, celebrity, or pet visible to the world.
             </p>
          </div>

          {/* Gallery Items */}
          {loadingItems ? (
             <div className="col-span-full py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
             </div>
          ) : items.length === 0 ? (
             <div className="col-span-full text-center py-12 text-slate-400">
                No memorials found in this category.
             </div>
          ) : (
            items.map((memorial) => {
                const isPet = memorial.type?.toLowerCase() === 'pet';
                
                return (
                  <div 
                    key={memorial.id} 
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group cursor-pointer border border-slate-100 flex flex-col"
                    onClick={() => navigate(`/memorial/${memorial.id}`)}
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={memorial.coverImage} 
                        alt={memorial.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale-[20%] group-hover:grayscale-0"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-slate-800 shadow-sm">
                        {memorial.type}
                      </div>
                      <div className="absolute top-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                        <Heart className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-xl text-slate-800 group-hover:text-indigo-800 transition-colors mb-1 truncate">
                          {memorial.name}
                        </h3>
                        <p className="text-xs text-slate-400 mb-4 font-light">{memorial.dates}</p>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 font-light leading-relaxed">
                          {memorial.bio}
                        </p>
                      </div>
                      
                      {/* Interaction Stats */}
                      <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                         <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium" title="Candles Lit">
                               <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-100" /> {memorial.stats.candles}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium" title={isPet ? 'Treats Given' : 'Flowers Offered'}>
                               {isPet ? <Bone className="w-3.5 h-3.5 text-slate-400 fill-slate-100" /> : <Flower2 className="w-3.5 h-3.5 text-pink-400 fill-pink-50" />} 
                               {memorial.stats.flowers}
                            </div>
                         </div>
                         <div className="text-slate-300 hover:text-indigo-500 transition-colors p-1 rounded-full hover:bg-indigo-50">
                            <Share2 className="w-4 h-4" />
                         </div>
                      </div>
                    </div>
                  </div>
                );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
