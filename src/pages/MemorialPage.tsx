import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Share2, Heart, Gift, Flame, Flower } from 'lucide-react';
import { FadeIn, Button, SectionTitle, Card, TextArea } from '../components/UI';
import { RWABadge } from '../components/RWABadge';
import { VirtualShop } from '../components/VirtualShop';
import { MEMORIAL_TEMPLATES, MOCK_MEMORIALS, SHOP_ITEMS } from '../constants'; // Keep MOCK for fallback/templates
import type { Memorial } from '../types';
import { usePhantomWallet } from '../hooks/usePhantomWallet';

const MemorialPage: React.FC = () => {
  const { id } = useParams();
  const { walletAddress, connectWallet } = usePhantomWallet();
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [message, setMessage] = useState('');
  const [isShopOpen, setIsShopOpen] = useState(false);
  
  // Legacy stats for backwards compatibility or summary
  const [localStats, setLocalStats] = useState({ candles: 0, flowers: 0, tributes: 0 });
  
  // New detailed stats
  const [localGongpinStats, setLocalGongpinStats] = useState<Record<string, number>>({});
  const [localPomScore, setLocalPomScore] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch item details from API
  useEffect(() => {
    const fetchMemorial = async () => {
        if (!id) return;
        try {
            const response = await fetch(`/api/item/stats?item_id=${id}`);
            if (response.ok) {
                const data = await response.json();
                const item = data.item;
                
                // Parse misc data
                let parsedMisc: any = {};
                try {
                    parsedMisc = item.misc ? JSON.parse(item.misc) : {};
                } catch { parsedMisc = {}; }

                // Parse gongpin stats
                const gongpinStats = parsedMisc.gongpin || {};

                const mockFallback = MOCK_MEMORIALS[0]; // Fallback for styles

                const mappedMemorial: Memorial = {
                    id: String(item.id),
                    name: item.title,
                    type: parsedMisc.type || 'Person',
                    dates: parsedMisc.dates || (parsedMisc.birthDate ? `${parsedMisc.birthDate} - ${parsedMisc.deathDate || ''}` : 'Unknown'),
                    bio: item.description ? item.description.replace(/<[^>]+>/g, '') : 'No description',
                    coverImage: parsedMisc.image || mockFallback.coverImage,
                    images: parsedMisc.images || [],
                    templateId: parsedMisc.templateId || 'ethereal-garden',
                    timeline: parsedMisc.timeline || [],
                    stats: { 
                        candles: Math.floor(data.stats['1hour'] / 1), // Approximation from delta
                        flowers: 0, 
                        tributes: 0, 
                        shares: 0 
                    },
                    messages: parsedMisc.messages || [],
                    badgeId: `RWA-${item.id}`,
                    pomScore: data.algorithm?.P || 0,
                    gongpinStats: gongpinStats,
                    onChainHash: parsedMisc.onChainHash
                };
                
                setMemorial(mappedMemorial);
                setLocalStats(mappedMemorial.stats);
                setLocalGongpinStats(gongpinStats);
                setLocalPomScore(mappedMemorial.pomScore || 0);
            } else {
                console.error("Failed to fetch memorial details");
                // Fallback to mock if API fails (for development/demo)
                const found = MOCK_MEMORIALS.find(m => m.id === id);
                if (found) {
                    setMemorial(found);
                    setLocalStats(found.stats);
                    setLocalGongpinStats({});
                    setLocalPomScore(found.pomScore || 0);
                } else {
                    setError("Memorial not found");
                }
            }
        } catch (error: any) {
            console.error("Error fetching memorial:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchMemorial();
    window.scrollTo(0,0);
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !memorial) return <div className="min-h-screen flex items-center justify-center">Error: {error || "Memorial not found"}</div>;

  const template = MEMORIAL_TEMPLATES.find(t => t.id === memorial.templateId) || MEMORIAL_TEMPLATES[1];

  const handlePurchase = async (item: any) => {
      if (!walletAddress) {
          try {
              await connectWallet();
          } catch (error) {
              console.error("Wallet connection failed:", error);
          }
          return;
      }

      // Call API to increment heat with tribute_id
      try {
          await fetch('/api/item/increment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  item_id: parseInt(memorial.id), 
                  tribute_id: item.id 
              })
          });
          console.log(`Tribute offered: ${item.id}`);
      } catch (err) {
          console.error('Failed to offer tribute:', err);
      }

      // Optimistic update
      setLocalGongpinStats(prev => ({
          ...prev,
          [item.id]: (prev[item.id] || 0) + 1
      }));
      
      // Update POM score (approximate)
      const delta = item.delta || 1;
      setLocalPomScore(prev => prev + delta);

      // Keep legacy stats updated for now if needed, or remove if unused
      setLocalStats(prev => {
          if (item.type === 'candle') return { ...prev, candles: prev.candles + 1 };
          if (item.type === 'flower') return { ...prev, flowers: prev.flowers + 1 };
          return { ...prev, tributes: prev.tributes + 1 };
      });
      setIsShopOpen(false);
  };

  return (
    <div className={`min-h-screen ${template.previewColor} transition-colors duration-1000`}>
      <VirtualShop 
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)} 
        onPurchase={handlePurchase} 
        memorialType={memorial.type}
        walletAddress={walletAddress}
        connectWallet={connectWallet}
      />
      
      {/* Dynamic Header based on Template */}
      <div className="relative h-[65vh] w-full overflow-hidden">
         <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10 }}
            className="absolute inset-0"
         >
             <div className="absolute inset-0 bg-black/30 z-10" />
             <img src={template.bgImage} className="w-full h-full object-cover" alt="Atmosphere" />
         </motion.div>

         {/* Cover Image Floating */}
         <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pt-20">
             <FadeIn>
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden mb-8 mx-auto">
                    <img src={memorial.coverImage} className="w-full h-full object-cover" alt={memorial.name} />
                </div>
                <h1 className="text-center font-serif text-5xl md:text-7xl text-white mb-2 drop-shadow-lg">{memorial.name}</h1>
                <p className="text-center text-xl text-white/80 font-light tracking-[0.2em] uppercase">{memorial.dates}</p>
             </FadeIn>
         </div>
      </div>

      {/* Interaction Bar - POM Drivers */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-30">
          <Card className="flex flex-wrap justify-between items-center gap-4 bg-white/90 backdrop-blur-md shadow-xl border-white/50 max-w-5xl mx-auto">
             <div className="flex gap-6 md:gap-8 mx-auto md:mx-0 flex-wrap justify-center">
                 {/* POM Score */}
                 <div className="text-center min-w-[60px]">
                     <div className="flex items-center gap-1 text-slate-800 justify-center">
                         <span className="font-bold text-lg font-mono">{Math.floor(localPomScore)}</span>
                     </div>
                     <span className="text-[10px] uppercase tracking-widest text-slate-400">POM</span>
                 </div>

                 {/* Dynamic Tributes */}
                 {SHOP_ITEMS.map(shopItem => {
                     const count = localGongpinStats[shopItem.id] || 0;
                     if (count === 0) return null;
                     
                     return (
                        <div key={shopItem.id} className="text-center min-w-[60px]">
                            <div className="flex items-center gap-1 text-slate-700 justify-center">
                                <span className="text-xl">{shopItem.icon}</span>
                                <span className="font-bold text-lg">{count}</span>
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-slate-400">{shopItem.name}</span>
                        </div>
                     );
                 })}
             </div>
             
             <Button 
                onClick={() => setIsShopOpen(true)}
                className="w-full md:w-auto bg-slate-900 text-white shadow-lg hover:bg-slate-800"
             >
                 <Heart size={16} className="text-red-400" fill="currentColor" />
                 Offer Tribute
             </Button>
          </Card>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pb-24">
         
         {/* Bio */}
         <FadeIn delay={0.2}>
            <div className="text-center py-8 mb-16">
                <span className="inline-block w-8 h-1 bg-slate-300 mb-6 rounded-full"></span>
                <p className="font-serif text-2xl md:text-3xl leading-relaxed text-slate-700 italic max-w-4xl mx-auto">
                    "{memorial.bio}"
                </p>
                {memorial.onChainHash && (
                    <div className="mt-6 flex justify-center">
                         <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                             Immutable Storage: {memorial.onChainHash}
                         </span>
                    </div>
                )}
            </div>
         </FadeIn>

         {/* Memory Waterfall */}
         <div className="mb-24">
            <SectionTitle title="Memory Lane" />
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
                {memorial.images.map((img, i) => (
                    <FadeIn key={i} delay={i * 0.1}>
                        <img src={img} className="w-full rounded-xl shadow-md hover:shadow-xl transition-shadow duration-500 border border-white/50" alt="Memory" />
                    </FadeIn>
                ))}
                
                {/* Embedded Timeline */}
                <FadeIn delay={0.4}>
                     <div className="bg-white/60 p-8 rounded-xl break-inside-avoid border border-white/50">
                        <h3 className="font-serif text-2xl mb-6">Timeline</h3>
                        <div className="space-y-8 border-l border-slate-300 ml-2 pl-6">
                            {memorial.timeline.map((event) => (
                                <div key={event.id} className="relative">
                                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-white"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{event.year}</span>
                                    <h4 className="font-serif text-lg text-slate-800">{event.title}</h4>
                                    <p className="text-sm text-slate-600 font-light mt-1">{event.description}</p>
                                </div>
                            ))}
                        </div>
                     </div>
                </FadeIn>
            </div>
         </div>

         {/* Community Wall */}
         <div className="mb-24 grid md:grid-cols-2 gap-12">
             <FadeIn>
                 <div className="sticky top-24">
                    <h3 className="font-serif text-3xl mb-4">Guest Book</h3>
                    <p className="text-slate-500 mb-6 font-light">Leave a public comment or a private whisper. Your words help keep the memory alive.</p>
                    <TextArea 
                        label="Your Message" 
                        value={message} 
                        onChange={e => setMessage(e.target.value)} 
                        placeholder="Share a memory..." 
                        className="bg-white"
                    />
                    <Button icon={MessageSquare} className="w-full justify-center">Post Message</Button>
                    <p className="text-[10px] text-slate-400 mt-4 text-center">
                        Messages are weighted in the POM algorithm.
                    </p>
                 </div>
             </FadeIn>
             <div className="space-y-4">
                 <h4 className="uppercase text-xs tracking-widest text-slate-400 mb-4">Recent Tributes</h4>
                 {memorial.messages.length === 0 && <p className="text-slate-400 italic text-sm">Be the first to leave a message.</p>}
                 {memorial.messages.map((msg, i) => (
                     <FadeIn key={msg.id} delay={i * 0.2}>
                         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                             <p className="text-slate-600 font-serif italic mb-4">"{msg.content}"</p>
                             <div className="text-xs text-slate-400 uppercase tracking-widest flex justify-between">
                                 <span>{msg.author}</span>
                                 <span>{msg.date}</span>
                             </div>
                         </div>
                     </FadeIn>
                 ))}
             </div>
         </div>

         {/* RWA Badge Section */}
         <FadeIn className="text-center py-12 border-t border-slate-200/50">
             <SectionTitle title="Eternal Proof" />
             <div className="flex justify-center mb-8">
                 <RWABadge id={memorial.badgeId} name={memorial.name} />
             </div>
             <div className="flex justify-center gap-4">
                 <Button variant="secondary" icon={Share2}>Share Memorial</Button>
             </div>
         </FadeIn>

      </div>
    </div>
  );
};

export default MemorialPage;