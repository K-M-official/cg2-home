import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Flame, Flower, ChevronRight } from 'lucide-react';
import { FadeIn, SectionTitle, Card, Button } from '../components/UI';
import { useGallery } from '../context/GalleryContext';

const GalleryPage: React.FC = () => {
    const navigate = useNavigate();
    const { groups, items, activeGroupId, setActiveGroupId, loadingGroups, loadingItems } = useGallery();

    console.log('GalleryPage Render:', { groups, loadingGroups, itemsCount: items.length });
    console.log('Groups detail:', groups);

    const displayItems = items;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="mb-8 flex flex-col justify-center items-center md:flex-row justify-between items-end gap-6">
                    <SectionTitle title="Remembrance Gallery"
                        subtitle="Echoes of beautiful lives, categorized by their impact."
                        className="mb-0 md:text-left text-center" />
                </div>

                {/* Controls */}
                <div className="mb-8 space-y-4">
                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar whitespace-nowrap">
                        <button
                            onClick={() => setActiveGroupId('All')}
                            disabled={loadingItems}
                            className={`px-6 py-2 rounded-full text-sm transition-all duration-300 border ${activeGroupId === 'All' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'} ${loadingItems ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            All
                        </button>
                        {loadingGroups ? (
                            <span className="text-slate-400 text-xs self-center px-4">Loading...</span>
                        ) : (
                            groups.map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => setActiveGroupId(group.id)}
                                    disabled={loadingItems}
                                    className={`px-6 py-2 rounded-full text-sm transition-all duration-300 border ${activeGroupId === group.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'} ${loadingItems ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {group.title}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Search */}
                    <div className="w-full relative flex items-center gap-2 justify-between">
                        <div className="relative flex-1">
                            <Search className=" absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                                placeholder="Search for a memory..."
                            />
                        </div>
                        <Button onClick={() => navigate('/create')} className="bg-blue-600 text-white hover:bg-blue-700">
                            <Plus size={18} />
                            Create Public Memorial
                        </Button>
                    </div>
                </div>

                {/* Items Grid (Changed from horizontal scroll to grid for simplicity and visibility) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" key={String(activeGroupId)}>
                    {loadingItems ? (
                        <div className="col-span-full text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
                        </div>
                    ) : displayItems.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            No memorials found in this category.
                        </div>
                    ) : (
                        displayItems.map((memorial, index) => (
                            <div key={memorial.id}>
                                <FadeIn delay={index * 0.05}>
                                    <Card className="h-[500px] hover:shadow-xl transition-shadow cursor-pointer flex flex-col p-0 overflow-hidden border-0 relative bg-white rounded-2xl" >
                                        <div
                                            className="h-3/5 overflow-hidden relative"
                                            onClick={() => navigate(`/memorial/${memorial.id}`)}
                                        >
                                            <img src={memorial.coverImage} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt={memorial.name} />

                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-800 shadow-sm">
                                                {memorial.type}
                                            </div>

                                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent pt-12">
                                                <h3 className="text-white font-serif text-2xl mb-1">{memorial.name}</h3>
                                                <p className="text-white/80 text-xs uppercase tracking-widest">{memorial.dates}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <p className="text-slate-600 font-light text-sm line-clamp-3">{memorial.bio}</p>

                                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                                <div className="flex gap-3">
                                                    <div className="flex items-center gap-1 text-slate-600" title="Candles">
                                                        <Flame size={14} className="text-orange-500" />
                                                        <span className="text-xs font-bold">{memorial.stats.candles}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-slate-600" title="Flowers">
                                                        <Flower size={14} className="text-pink-500" />
                                                        <span className="text-xs font-bold">{memorial.stats.flowers}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-slate-600" title="Other Tributes">
                                                        <span className="text-sm">🎁</span>
                                                        <span className="text-xs font-bold">{memorial.stats.tributes}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-row items-center gap-3">
                                                    <div className="flex flex-col items-end">
                                                       <span className="text-[10px] uppercase text-slate-400 leading-none mb-1">POM</span>
                                                       <span className="font-mono text-sm text-emerald-600 font-bold leading-none">{Math.floor(memorial.pomScore || 0)}</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-slate-200"></div>
                                                    <div className="flex flex-col items-end">
                                                       <span className="text-[10px] uppercase text-slate-400 leading-none mb-1">DELTA</span>
                                                       <span className="font-mono text-sm text-slate-500 font-bold leading-none">{(memorial.delta || 0).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </FadeIn>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default GalleryPage;
