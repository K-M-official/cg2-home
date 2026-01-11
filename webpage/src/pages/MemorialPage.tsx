import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Candle } from '../components/Candle';
import { Button } from '../components/UI';
import { Hexagon, Share2, Shield, Globe, Flower2, Bone, Heart, Plus, Upload, X } from 'lucide-react';
import { VirtualShop } from '../components/VirtualShop';
import { useGallery } from '../context/GalleryContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { API_BASE_URL } from '../constants';

// ==================== Sub Components ====================

/**
 * Upload Image Modal Component
 */
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
  uploadFile: File | null;
  setUploadFile: (file: File | null) => void;
  uploadCaption: string;
  setUploadCaption: (caption: string) => void;
  uploadYear: string;
  setUploadYear: (year: string) => void;
}

const UploadImageModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  uploadFile,
  setUploadFile,
  uploadCaption,
  setUploadCaption,
  uploadYear,
  setUploadYear
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-serif text-slate-900 mb-6">Upload Image</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Caption (optional)</label>
            <input
              type="text"
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="Add a caption..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Year (optional)</label>
            <input
              type="number"
              value={uploadYear}
              onChange={(e) => setUploadYear(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="e.g., 2020"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
              disabled={!uploadFile}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Timeline Event Modal Component
 */
interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  year: string;
  setYear: (year: string) => void;
  month: string;
  setMonth: (month: string) => void;
  day: string;
  setDay: (day: string) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

const TimelineEventModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  year,
  setYear,
  month,
  setMonth,
  day,
  setDay,
  title,
  setTitle,
  description,
  setDescription
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-serif text-slate-900 mb-6">Add Timeline Event</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Year *</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
                placeholder="2020"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Month</label>
              <input
                type="number"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
                placeholder="12"
                min="1"
                max="12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Day</label>
              <input
                type="number"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
                placeholder="25"
                min="1"
                max="31"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="Event title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="Event description..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!year || !title}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Memorial Header Component
 */
interface MemorialHeaderProps {
  memorial: any;
  isPublicRanked: boolean;
}

const MemorialHeader: React.FC<MemorialHeaderProps> = ({ memorial, isPublicRanked }) => {
  return (
    <div className="relative h-[60vh] lg:h-[70vh] w-full overflow-hidden bg-slate-900">
      <div className="absolute inset-0 bg-slate-900/30 z-10"></div>
      <img src={memorial.coverImage} alt="Cover" className="w-full h-full object-cover animate-fade-in scale-105 transform origin-center opacity-90" style={{ animationDuration: '3s' }} />

      <div className="absolute inset-0 z-20 bg-gradient-to-t from-white via-transparent to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16 z-30 text-center">
        <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
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

          <h1 className="text-5xl lg:text-8xl font-serif text-slate-900 mb-4">{memorial.name}</h1>
          <p className="text-xl font-light text-slate-600 font-serif italic">{memorial.dates}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Ritual Section Component
 */
interface RitualSectionProps {
  memorial: any;
  isPet: boolean;
  hasLitCandle: boolean;
  hasGiven: boolean;
  flowerCount: number;
  onLightCandle: () => void;
  onOpenShop: () => void;
}

const RitualSection: React.FC<RitualSectionProps> = ({
  memorial,
  isPet,
  hasLitCandle,
  hasGiven,
  flowerCount,
  onLightCandle,
  onOpenShop
}) => {
  return (
    <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-40 mb-16">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-100/50 border border-white flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="lg:w-1/2 text-center lg:text-left">
          <div className="flex justify-center lg:justify-between items-baseline mb-2">
            <h3 className="text-lg font-serif text-slate-800">Biography</h3>
          </div>
          <p className="text-slate-600 font-light leading-relaxed mb-4 line-clamp-4">
            {memorial.bio}
          </p>
          <div className="flex gap-4 justify-center lg:justify-start text-xs text-slate-400 uppercase tracking-widest">
            <span>POM Score: {Math.floor(memorial.pomScore || 0)}</span>
            <span>Delta: {memorial.delta?.toFixed(2)}</span>
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-wrap items-center justify-center lg:justify-end gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
          <Candle initialCount={memorial.stats.candles} onLight={onLightCandle} />

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onOpenShop}
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

          <div className="h-10 w-px bg-slate-200 hidden lg:block"></div>

          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <Button
              variant="primary"
              className="text-xs py-2 px-4 w-full bg-slate-900 text-white hover:bg-slate-800"
              onClick={onOpenShop}
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
  );
};

/**
 * Gallery Tab Component
 */
interface GalleryTabProps {
  memorial: any;
  isAuthenticated: boolean;
  onOpenUpload: () => void;
}

const GalleryTab: React.FC<GalleryTabProps> = ({ memorial, isAuthenticated, onOpenUpload }) => {
  const [selectedImage, setSelectedImage] = React.useState<any>(null);
  const { setNavbarVisible } = useUI();

  // 打开/关闭 Modal 时控制 navbar 显示
  React.useEffect(() => {
    if (selectedImage) {
      setNavbarVisible(false);
      document.body.style.overflow = 'hidden'; // 禁止背景滚动
    } else {
      setNavbarVisible(true);
      document.body.style.overflow = 'unset';
    }

    return () => {
      setNavbarVisible(true);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, setNavbarVisible]);

  return (
    <div className="relative">
      {isAuthenticated && (
        <button
          onClick={onOpenUpload}
          className="fixed bottom-24 right-8 z-[60] flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-105"
        >
          <Upload className="w-5 h-5" />
          <span className="hidden lg:inline">Upload Image</span>
        </button>
      )}

      <div className="columns-1 lg:columns-2 lg:columns-3 gap-8 space-y-8 animate-fade-in">
        {memorial.images.map((img: any, i: number) => (
          <div key={i} className="break-inside-avoid group cursor-pointer" onClick={() => setSelectedImage(img)}>
            <div className="rounded-xl overflow-hidden mb-3 bg-slate-100">
              <img
                src={img.image_url || img}
                alt="Memory"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="px-2">
              <p className="text-sm text-slate-700 mb-1">
                {img.caption || <span className="text-slate-400 italic">No caption</span>}
              </p>
              <p className="text-xs text-slate-500">
                {img.year || <span className="text-slate-400 italic">Year not specified</span>}
              </p>
            </div>
          </div>
        ))}
        {memorial.images.length === 0 && (
          <div className="text-center py-20 text-slate-400 italic w-full col-span-full">
            No images uploaded yet.
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="fixed top-6 right-6 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors z-[10000] shadow-lg border border-white/30"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.image_url || selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {(selectedImage.caption || selectedImage.year) && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-lg px-6 py-4 text-white max-w-2xl">
                {selectedImage.caption && (
                  <p className="text-base font-medium mb-1">{selectedImage.caption}</p>
                )}
                {selectedImage.year && (
                  <p className="text-sm text-slate-300">{selectedImage.year}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Timeline Tab Component
 */
interface TimelineTabProps {
  memorial: any;
  isAuthenticated: boolean;
  onOpenModal: () => void;
}

const TimelineTab: React.FC<TimelineTabProps> = ({ memorial, isAuthenticated, onOpenModal }) => {
  return (
    <div className="relative">
      {isAuthenticated && (
        <button
          onClick={onOpenModal}
          className="fixed bottom-24 right-8 z-[60] flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden lg:inline">Add Event</span>
        </button>
      )}

      <div className="max-w-2xl mx-auto space-y-12 animate-fade-in">
        {memorial.timeline && memorial.timeline.length > 0 ? memorial.timeline.map((event: any) => (
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
    </div>
  );
};

/**
 * Tributes Tab Component
 */
interface TributesTabProps {
  memorial: any;
  isAuthenticated: boolean;
  tributeMessage: string;
  setTributeMessage: (message: string) => void;
  onSubmit: () => void;
}

const TributesTab: React.FC<TributesTabProps> = ({
  memorial,
  isAuthenticated,
  tributeMessage,
  setTributeMessage,
  onSubmit
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {isAuthenticated && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
          <textarea
            className="w-full bg-white p-4 rounded-lg border border-slate-200 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-slate-300"
            placeholder="Leave a message..."
            rows={3}
            value={tributeMessage}
            onChange={(e) => setTributeMessage(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              className="text-xs bg-slate-900 text-white"
              onClick={onSubmit}
            >
              Post Message
            </Button>
          </div>
        </div>
      )}

      {memorial.messages.map((msg: any) => (
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
  );
};

// ==================== Main Component ====================

const MemorialPage: React.FC = () => {
  const { id } = useParams();
  const { currentMemorial, loadingMemorial, fetchMemorial, offerTribute } = useGallery();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'timeline' | 'gallery' | 'tributes'>('gallery');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [hasLitCandle, setHasLitCandle] = useState(false);
  const [hasGiven, setHasGiven] = useState(false);

  // Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [tributeMessage, setTributeMessage] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadYear, setUploadYear] = useState('');

  // Timeline form states
  const [timelineYear, setTimelineYear] = useState('');
  const [timelineMonth, setTimelineMonth] = useState('');
  const [timelineDay, setTimelineDay] = useState('');
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDescription, setTimelineDescription] = useState('');

  useEffect(() => {
    if (id) {
      fetchMemorial(id);
    }
    window.scrollTo(0, 0);
  }, [id]);

  const handleLightCandle = async () => {
    if (hasLitCandle) return;
    setHasLitCandle(true);
  };

  const handlePurchase = async (item: any) => {
    if (id && currentMemorial) {
      const result = await offerTribute(id, item.id);
      if (result.success) {
        setHasGiven(true);
      }
    }
    setIsShopOpen(false);
  };

  const handleGalleryUpload = async () => {
    if (!uploadFile || !id) return;

    const formData = new FormData();
    formData.append('image', uploadFile);
    formData.append('item_id', id);
    if (uploadCaption) formData.append('caption', uploadCaption);
    if (uploadYear) formData.append('year', uploadYear);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch( `${API_BASE_URL}/api/content/gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Image uploaded successfully! It will be visible after moderation.');
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadCaption('');
        setUploadYear('');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const handleTimelineSubmit = async () => {
    if (!timelineYear || !timelineTitle || !id) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/content/timeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item_id: parseInt(id),
          year: parseInt(timelineYear),
          month: timelineMonth ? parseInt(timelineMonth) : null,
          day: timelineDay ? parseInt(timelineDay) : null,
          title: timelineTitle,
          description: timelineDescription
        })
      });

      if (response.ok) {
        alert('Timeline event created! It will be visible after moderation.');
        setShowTimelineModal(false);
        setTimelineYear('');
        setTimelineMonth('');
        setTimelineDay('');
        setTimelineTitle('');
        setTimelineDescription('');
      }
    } catch (error) {
      console.error('Timeline creation failed:', error);
      alert('Failed to create timeline event.');
    }
  };

  const handleTributeSubmit = async () => {
    if (!tributeMessage || !id) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/content/tribute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item_id: parseInt(id),
          content: tributeMessage
        })
      });

      if (response.ok) {
        alert('Tribute posted! It will be visible after moderation.');
        setTributeMessage('');
      }
    } catch (error) {
      console.error('Tribute submission failed:', error);
      alert('Failed to post tribute.');
    }
  };

  const memorial = currentMemorial;
  const isPet = memorial?.type?.toLowerCase() === 'pet';
  const isPublicRanked = (memorial?.pomScore || 0) > 100;
  const flowerCount = memorial?.gongpinStats
    ? Object.values(memorial.gongpinStats).reduce((a: any, b: any) => a + b, 0)
    : 0;

  if (loadingMemorial) return <div className="flex items-center justify-center bg-slate-50 py-32">Loading...</div>;
  if (!memorial) return <div className="flex items-center justify-center bg-slate-50 py-32">Memorial not found</div>;

  return (
    <div className="bg-white font-sans text-slate-900">
      <VirtualShop
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onPurchase={handlePurchase}
        memorialType={memorial.type}
      />

      <MemorialHeader memorial={memorial} isPublicRanked={isPublicRanked} />

      <RitualSection
        memorial={memorial}
        isPet={isPet}
        hasLitCandle={hasLitCandle}
        hasGiven={hasGiven}
        flowerCount={flowerCount}
        onLightCandle={handleLightCandle}
        onOpenShop={() => setIsShopOpen(true)}
      />

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

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 pb-32 min-h-[500px]">
        {activeTab === 'gallery' && (
          <GalleryTab
            memorial={memorial}
            isAuthenticated={isAuthenticated}
            onOpenUpload={() => setShowUploadModal(true)}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab
            memorial={memorial}
            isAuthenticated={isAuthenticated}
            onOpenModal={() => setShowTimelineModal(true)}
          />
        )}

        {activeTab === 'tributes' && (
          <TributesTab
            memorial={memorial}
            isAuthenticated={isAuthenticated}
            tributeMessage={tributeMessage}
            setTributeMessage={setTributeMessage}
            onSubmit={handleTributeSubmit}
          />
        )}
      </div>

      <UploadImageModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleGalleryUpload}
        uploadFile={uploadFile}
        setUploadFile={setUploadFile}
        uploadCaption={uploadCaption}
        setUploadCaption={setUploadCaption}
        uploadYear={uploadYear}
        setUploadYear={setUploadYear}
      />

      <TimelineEventModal
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        onSubmit={handleTimelineSubmit}
        year={timelineYear}
        setYear={setTimelineYear}
        month={timelineMonth}
        setMonth={setTimelineMonth}
        day={timelineDay}
        setDay={setTimelineDay}
        title={timelineTitle}
        setTitle={setTimelineTitle}
        description={timelineDescription}
        setDescription={setTimelineDescription}
      />
    </div>
  );
};

export default MemorialPage;
