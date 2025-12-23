import React, { useState, useEffect } from 'react';
import { CreateStep } from '../types';
import { Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, ChevronRight, ChevronLeft, Hexagon, Cloud, Lock } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

export const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { isWeb3Mode } = useWeb3();
  const [step, setStep] = useState<CreateStep>(CreateStep.BASIC_INFO);
  const [loading, setLoading] = useState(false);
  
  // State for relationship options
  const [relationshipOptions, setRelationshipOptions] = useState<string[]>([]);
  const [isOtherRelationship, setIsOtherRelationship] = useState(false);
  const [customRelationship, setCustomRelationship] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(true);
  
  // Image upload state
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    dates: '',
    relationship: '',
    keywords: '',
    description: '',
    theme: 'modern',
    type: 'private' // Default to Cloud Memorial
  });

  // Load existing groups (categories) from backend
  useEffect(() => {
    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups');
            if (res.ok) {
                const data = await res.json();
                if (data.groups && Array.isArray(data.groups)) {
                    const titles = data.groups.map((g: any) => g.title);
                    setRelationshipOptions(titles);
                    // Set first option as default if available
                    if (titles.length > 0 && !formData.relationship) {
                        setFormData(prev => ({ ...prev, relationship: titles[0] }));
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fetch groups', e);
        } finally {
            setLoadingGroups(false);
        }
    };
    fetchGroups();
  }, []);

  const handleRelationshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val === 'Other') {
          setIsOtherRelationship(true);
          setFormData({ ...formData, relationship: '' }); // Clear for custom input
      } else {
          setIsOtherRelationship(false);
          setFormData({ ...formData, relationship: val });
      }
  };

  const handleNext = async () => {
    if (step < CreateStep.BADGE) {
      setStep(prev => prev + 1);
    } else {
      // Finalize and Create
      setLoading(true);
      
      const relationshipToSubmit = isOtherRelationship ? customRelationship : formData.relationship;

      if (!formData.name) {
          alert("Please enter a name.");
          setLoading(false);
          return;
      }
      if (!relationshipToSubmit) {
          alert("Please specify a relationship.");
          setLoading(false);
          return;
      }

      try {
          // 使用 FormData 上传图片
          const formDataToSend = new FormData();
          formDataToSend.append('group_name', relationshipToSubmit);
          formDataToSend.append('title', formData.name);
          formDataToSend.append('description', formData.description || `Memorial for ${formData.name}`);
          
          const miscData = {
              ...formData,
              relationship: relationshipToSubmit
          };
          formDataToSend.append('misc', JSON.stringify(miscData));

          // 如果有图片文件，添加到 FormData
          if (coverImageFile) {
              formDataToSend.append('coverImage', coverImageFile);
          }

          const res = await fetch('/api/items', {
              method: 'POST',
              body: formDataToSend
              // 不设置 Content-Type，让浏览器自动设置 multipart/form-data 边界
          });

          if (!res.ok) {
              const err = await res.json();
              throw new Error(err.message || 'Failed to create memorial');
          }

          const data = await res.json();
          // Assuming backend returns { success: true, id: number }
          // Redirect to the new memorial page (mock ID for now if needed, or use real one)
          // In real app, we might need to wait for indexing or just go to gallery/leaderboard
          
          setTimeout(() => navigate('/memorial/' + data.id), 1500); 

      } catch (error: any) {
          console.error("Creation failed", error);
          alert("Failed to create memorial: " + error.message);
          setLoading(false);
      }
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const renderStepContent = () => {
    switch(step) {
      case CreateStep.BASIC_INFO:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
               <Cloud className="w-4 h-4" />
               <span className="font-medium">Creating a Private Cloud Memorial</span>
            </div>
            <h2 className="text-2xl font-serif text-slate-800">Who are we remembering?</h2>
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                <span className="text-slate-500 text-sm mb-1 block">Full Name</span>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all font-serif text-lg text-slate-900"
                  placeholder="e.g. Eleanor Rigby"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </label>
              <label className="block">
                <span className="text-slate-500 text-sm mb-1 block">Dates (Birth - Passing)</span>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all text-slate-900"
                  placeholder="e.g. 1950 - 2023"
                  value={formData.dates}
                  onChange={e => setFormData({...formData, dates: e.target.value})}
                />
              </label>
              <label className="block">
                <span className="text-slate-500 text-sm mb-1 block">Relationship Category</span>
                <select 
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all text-slate-900 mb-2"
                  value={isOtherRelationship ? 'Other' : formData.relationship}
                  onChange={handleRelationshipChange}
                  disabled={loadingGroups}
                >
                  {loadingGroups ? (
                      <option value="">Loading categories...</option>
                  ) : (
                      <>
                        {relationshipOptions.length === 0 && (
                            <option value="">No categories yet</option>
                        )}
                        {relationshipOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="Other">+ Create New Category</option>
                      </>
                  )}
                </select>
                
                {isOtherRelationship && (
                    <input 
                        type="text"
                        className="w-full px-4 py-3 rounded-lg bg-white border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all text-slate-900 animate-fade-in"
                        placeholder="Enter new category (e.g. Mentor, Hero)"
                        value={customRelationship}
                        onChange={e => setCustomRelationship(e.target.value)}
                        autoFocus
                    />
                )}
              </label>
            </div>
          </div>
        );
      case CreateStep.STYLE:
        return (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-2xl font-serif text-slate-800">Choose a Sanctuary Style</h2>
             <div className="grid grid-cols-2 gap-4">
               {['Classic Warmth', 'Cosmic Eternity', 'Nature Peace', 'Modern Minimal'].map((style) => (
                 <button 
                  key={style}
                  onClick={() => setFormData({...formData, theme: style.toLowerCase()})}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.theme === style.toLowerCase() 
                    ? 'border-indigo-300 bg-indigo-50 shadow-md ring-1 ring-indigo-200' 
                    : 'border-slate-100 hover:border-slate-300 bg-white'
                  }`}
                 >
                   <div className={`w-8 h-8 rounded-full mb-3 ${
                     style.includes('Cosmic') ? 'bg-slate-900' : 
                     style.includes('Nature') ? 'bg-emerald-100' : 'bg-orange-50'
                   }`}></div>
                   <span className="font-serif text-slate-700">{style}</span>
                 </button>
               ))}
             </div>
          </div>
        );
      case CreateStep.CONTENT:
        return (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-2xl font-serif text-slate-800">Tell their story</h2>
             
             <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-24 h-24 text-indigo-500" />
                </div>
                
                <label className="block mb-4">
                  <span className="text-slate-500 text-sm mb-1 block">Describe them in a few keywords</span>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 focus:outline-none text-slate-900"
                    placeholder="e.g. gentle, lover of jazz, kind grandmother"
                    value={formData.keywords}
                    onChange={e => setFormData({...formData, keywords: e.target.value})}
                  />
                </label>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-sm">Biography</span>
                </div>
                <textarea 
                  className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all min-h-[120px] font-light leading-relaxed resize-none text-slate-900"
                  placeholder="Their story will appear here..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
             </div>

             {coverImage ? (
               <div className="relative border-2 border-slate-200 rounded-xl overflow-hidden group">
                 <img src={coverImage} alt="Cover preview" className="w-full h-48 object-cover" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <button
                     onClick={() => document.getElementById('cover-photo-input')?.click()}
                     className="px-4 py-2 bg-white text-slate-800 rounded-lg text-sm hover:bg-slate-100 transition-colors"
                   >
                     Change Photo
                   </button>
                   <button
                     onClick={() => {
                       setCoverImage(null);
                       setCoverImageFile(null);
                     }}
                     className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                   >
                     Remove
                   </button>
                 </div>
               </div>
             ) : (
               <div 
                 className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group"
                 onClick={() => document.getElementById('cover-photo-input')?.click()}
               >
                 <Upload className="w-8 h-8 mx-auto text-slate-300 group-hover:text-slate-500 mb-2 transition-colors" />
                 <p className="text-sm text-slate-500">Upload Cover Photo</p>
                 <p className="text-xs text-slate-400 mt-1">Click to select an image</p>
               </div>
             )}
             <input 
               id="cover-photo-input"
               type="file" 
               accept="image/*"
               className="hidden"
               onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   setCoverImageFile(file);
                   // 创建预览 URL
                   const reader = new FileReader();
                   reader.onloadend = () => {
                     setCoverImage(reader.result as string);
                   };
                   reader.readAsDataURL(file);
                 }
               }}
             />
          </div>
        );
      case CreateStep.BADGE:
        return (
          <div className="space-y-8 animate-fade-in text-center pt-8">
             <div className="relative inline-block">
               <div className="absolute inset-0 bg-indigo-200 blur-2xl opacity-40 rounded-full animate-pulse-slow"></div>
               <Hexagon className="w-32 h-32 text-slate-800 mx-auto relative z-10 stroke-1 fill-white/50 backdrop-blur-md" />
               <div className="absolute inset-0 flex items-center justify-center z-20 flex-col">
                 <Lock className="w-6 h-6 text-slate-600 mb-1" />
                 <span className="text-sm font-serif text-slate-800">Private Token</span>
               </div>
             </div>
             
             <div>
               <h2 className="text-2xl font-serif text-slate-800 mb-2">Minting Digital Heritage Token</h2>
               <p className="text-slate-500 max-w-xs mx-auto text-sm">
                 A permanent, encrypted proof of this Cloud Memorial on the K&M ERA network.
               </p>
             </div>

             <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-xs text-emerald-800 inline-block">
               Status: <span className="font-mono">Ready to mint for {formData.name || 'Soul'}</span>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-24 pb-12 px-6">

      {/* Web3 Mode Warning */}
      {isWeb3Mode && (
        <div className="w-full max-w-xl mb-8 p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-indigo-900">Web3 Mode Active</h3>
          </div>
          <p className="text-sm text-indigo-700 mb-4">
            Token creation is disabled in Web3 mode. You can only view existing tokens and their basic information.
          </p>
          <button
            onClick={() => navigate('/heritage')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            View Tokens
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-12">
        <div className="flex justify-between mb-2">
          {['Info', 'Style', 'Story', 'Private Token'].map((label, idx) => (
            <span key={label} className={`text-xs uppercase tracking-wider ${idx <= step ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
              {label}
            </span>
          ))}
        </div>
        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-slate-800 transition-all duration-700 ease-out"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Card */}
      <div className={`w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 lg:p-12 relative overflow-hidden min-h-[550px] flex flex-col justify-between ${isWeb3Mode ? 'opacity-50 pointer-events-none' : ''}`}>
         {/* Gentle Background Blob */}
         <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

         <div className="relative z-10 flex-grow">
           {renderStepContent()}
         </div>

         <div className="relative z-10 flex justify-between mt-8 pt-6 border-t border-slate-100">
           <Button 
             variant="ghost" 
             onClick={handleBack} 
             disabled={step === 0 || loading}
             className={step === 0 ? 'invisible' : ''}
           >
             <ChevronLeft className="w-4 h-4" /> Back
           </Button>
           
           <Button 
             onClick={handleNext} 
             disabled={loading}
             className="min-w-[120px]"
           >
             {loading ? (
                <>
                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                 Processing
                </>
             ) : (
                <>
                  {step === CreateStep.BADGE ? 'Create & Mint' : 'Continue'} 
                  {step !== CreateStep.BADGE && <ChevronRight className="w-4 h-4 ml-1" />}
                </>
             )}
           </Button>
         </div>
      </div>
    </div>
  );
};

export default CreatePage;