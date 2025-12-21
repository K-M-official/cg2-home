import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Candle } from '../components/Candle';
import { Button } from '../components/UI';
import { Hexagon, Share2, Shield, Globe, Flower2, Bone, Heart } from 'lucide-react';
import { VirtualShop } from '../components/VirtualShop';
import { useGallery } from '../context/GalleryContext';

const MemorialPage: React.FC = () => {
  const { id } = useParams();
  const { currentMemorial, loadingMemorial, fetchMemorial, offerTribute } = useGallery();
  
  const [activeTab, setActiveTab] = useState<'timeline' | 'gallery' | 'tributes'>('gallery');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [hasLitCandle, setHasLitCandle] = useState(false);
  const [hasGiven, setHasGiven] = useState(false);

  // Fetch Logic via Context
  useEffect(() => {
    if (id) {
        fetchMemorial(id);
    }
    window.scrollTo(0, 0);
  }, [id]);

  // Interaction Handlers
  const handleLightCandle = async () => {
      if (hasLitCandle) return;
      // Simulate API call for lighting candle (could also be moved to context if needed)
      setHasLitCandle(true);
  };

  const handlePurchase = async (item: any) => {
      // TODO: Implement authentication check before purchase
      // User should be logged in to make purchases

      if (id && currentMemorial) {
          const result = await offerTribute(id, item.id);
          if (result.success) {
              setHasGiven(true);
          }
      }
      setIsShopOpen(false);
  };

  // Derived State
  const memorial = currentMemorial;
  const isPet = memorial?.type?.toLowerCase() === 'pet';
  const isPublicRanked = (memorial?.pomScore || 0) > 100; 
  
  // Calculate totals from context data
  const flowerCount = memorial?.gongpinStats 
      ? Object.values(memorial.gongpinStats).reduce((a, b) => a + b, 0) 
      : 0;

  if (loadingMemorial) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  if (!memorial) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Memorial not found</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <VirtualShop
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onPurchase={handlePurchase}
        memorialType={memorial.type}
      />

      {/* Immersive Header */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-slate-900/30 z-10"></div>
        <img src={memorial.coverImage} alt="Cover" className="w-full h-full object-cover animate-fade-in scale-105 transform origin-center opacity-90" style={{ animationDuration: '3s' }} />
        
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-30 text-center">
          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            
            {/* Token Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border mb-6 ${
              isPublicRanked 
                ? 'bg-amber-100/80 border-amber-200 text-amber-900' 
                : 'bg-white/30 border-white/40 text-slate-900'
            }`}>
              {isPublicRanked ? <Globe className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
              <span className="text-xs uppercase tracking-widest font-semibold">
                {isPublicRanked ? `Ranked • Gold Heritage Token` : 'Private Heritage Token'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-serif text-slate-900 mb-4">{memorial.name}</h1>
            <p className="text-xl font-light text-slate-600 font-serif italic">{memorial.dates}</p>
          </div>
        </div>
      </div>

      {/* Ritual Section */}
      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-40 mb-16">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-100/50 border border-white flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="md:w-1/2 text-center md:text-left">
             <div className="flex justify-center md:justify-between items-baseline mb-2">
               <h3 className="text-lg font-serif text-slate-800">Biography</h3>
             </div>
             <p className="text-slate-600 font-light leading-relaxed mb-4 line-clamp-4">
               {memorial.bio}
             </p>
             <div className="flex gap-4 justify-center md:justify-start text-xs text-slate-400 uppercase tracking-widest">
                {/* Using Context Data Directly */}
                <span>POM Score: {Math.floor(memorial.pomScore || 0)}</span>
                <span>Delta: {memorial.delta?.toFixed(2)}</span>
             </div>
           </div>
           
           {/* Interactive Elements */}
           <div className="md:w-1/2 flex flex-wrap items-center justify-center md:justify-end gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
             
             {/* Candle */}
             <Candle initialCount={memorial.stats.candles} onLight={handleLightCandle} />
             
             {/* Category Specific Interaction */}
             <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => setIsShopOpen(true)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    hasGiven 
                      ? 'bg-emerald-100 text-emerald-600 scale-110 shadow-inner' 
                      : 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200'
                  }`}
                >
                   {isPet ? <Bone className="w-5 h-5" /> : <Flower2 className="w-5 h-5" />}
                </button>
                <span className="text-xs font-sans text-slate-400 tracking-wider">
                  {hasGiven ? 'Thanks for offering! ' : ''}
                  {flowerCount} {isPet ? 'Treats' : 'Flowers'}
                </span>
             </div>

             <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

             <div className="flex flex-col gap-2 w-full md:w-auto">
               <Button 
                 variant="primary" 
                 className="text-xs py-2 px-4 w-full bg-slate-900 text-white hover:bg-slate-800"
                 onClick={() => setIsShopOpen(true)}
               >
                 <Heart className="w-3 h-3 mr-2" /> Leave Tribute
               </Button>
               <Button variant="secondary" className="text-xs py-2 px-4 w-full">
                 <Share2 className="w-3 h-3 mr-2" /> Share Space
               </Button>
             </div>
           </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-12 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50 pt-4">
        {['gallery', 'timeline', 'tributes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-4 text-sm uppercase tracking-widest transition-all relative ${
              activeTab === tab ? 'text-slate-900 font-medium' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900"></div>
            )}
          </button>
        ))}
      </div>

      {/* Content Area - Masonry Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-32 min-h-[500px]">
        {activeTab === 'gallery' && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 animate-fade-in">
            {memorial.images.map((img, i) => (
              <div key={i} className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer">
                <img src={img} alt="Memory" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
              </div>
            ))}
            {memorial.images.length === 0 && (
                <div className="text-center py-20 text-slate-400 italic w-full col-span-full">
                    No images uploaded yet.
                </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
           <div className="max-w-2xl mx-auto space-y-12 animate-fade-in">
             {memorial.timeline && memorial.timeline.length > 0 ? memorial.timeline.map((event) => (
               <div key={event.id} className="flex gap-8 group">
                 <div className="w-24 text-right pt-2 font-serif text-2xl text-slate-300 group-hover:text-slate-800 transition-colors">
                   {event.year}
                 </div>
                 <div className="flex-1 border-l border-slate-200 pl-8 pb-12 relative">
                   <div className="absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full bg-slate-200 group-hover:bg-indigo-300 transition-colors"></div>
                   <div className="bg-slate-50 p-6 rounded-xl group-hover:shadow-md transition-shadow duration-500">
                     <h4 className="font-medium text-slate-800 mb-2">{event.title}</h4>
                     <p className="text-slate-500 font-light text-sm">
                       {event.description}
                     </p>
                   </div>
                 </div>
               </div>
             )) : (
                <div className="text-center py-20 text-slate-400 italic">
                    No timeline events recorded.
                </div>
             )}
           </div>
        )}
        
        {activeTab === 'tributes' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
             {/* Message Input Mock */}
             <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                <textarea 
                    className="w-full bg-white p-4 rounded-lg border border-slate-200 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    placeholder="Leave a message..."
                    rows={3}
                />
                <div className="flex justify-end">
                    <Button variant="primary" className="text-xs bg-slate-900 text-white">Post Message</Button>
                </div>
             </div>

             {memorial.messages.map((msg, i) => (
                 <div key={msg.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                     <p className="text-slate-600 font-serif italic mb-4">"{msg.content}"</p>
                     <div className="text-xs text-slate-400 uppercase tracking-widest flex justify-between">
                         <span>{msg.author}</span>
                         <span>{msg.date}</span>
                     </div>
                 </div>
             ))}
             {memorial.messages.length === 0 && (
                <div className="text-center py-10 text-slate-400 italic">
                    Be the first to leave a tribute.
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemorialPage;
