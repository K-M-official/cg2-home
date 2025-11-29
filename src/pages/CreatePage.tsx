import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, ArrowRight, ArrowLeft, Check, Lock, Database } from 'lucide-react';
import { FadeIn, Button, Input, TextArea, SectionTitle, Card } from '../components/UI';
import { MEMORIAL_TEMPLATES } from '../constants';
// import { generateMemorialBio } from '../services/geminiService';
import { RWABadge } from '../components/RWABadge';

const steps = [
  { id: 1, title: "Identity", desc: "Who are we remembering?" },
  { id: 2, title: "Sanctuary", desc: "Choose a DIY Template." },
  { id: 3, title: "Essence", desc: "Add bio and memories." },
  { id: 4, title: "Consecration", desc: "Generate eternal badge." },
];

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingAI, setLoadingAI] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dates: '',
    type: 'Person',
    templateId: 'cosmic-voyage',
    bio: '',
    traits: '',
    memories: ''
  });

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(c => c + 1);
    else navigate('/memorial/1'); // Mock redirect to newly created page
  };
  
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleGenerateBio = async () => {
    if (!formData.name || !formData.traits) return;
    setLoadingAI(true);
    const generated = 'test'; // await generateMemorialBio(formData.name, formData.traits, formData.memories);
    setFormData(prev => ({ ...prev, bio: generated }));
    setLoadingAI(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-16 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-10"></div>
            {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 ${currentStep >= step.id ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-300'}`}>
                        {currentStep > step.id ? <Check size={14} /> : <span className="text-xs">{step.id}</span>}
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest mt-2 ${currentStep === step.id ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</span>
                </div>
            ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="min-h-[400px] flex flex-col justify-center">
              
              {currentStep === 1 && (
                <div className="space-y-6">
                   <SectionTitle title="Basic Identity" subtitle="Create a public or private memorial space." />
                   <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                      <Lock className="text-blue-400 shrink-0" size={20} />
                      <p className="text-xs text-blue-800">Your data will be permanently stored on the K&M Protocol blockchain. This ensures eternal preservation.</p>
                   </div>

                   <Input 
                      label="Name of Honoree" 
                      placeholder="e.g. Eleanor Rigby" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                   <div className="grid grid-cols-2 gap-4">
                     <Input 
                        label="Life Dates" 
                        placeholder="e.g. 1950 - 2023" 
                        value={formData.dates}
                        onChange={e => setFormData({...formData, dates: e.target.value})}
                     />
                     <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 ml-1">Type</label>
                        <select 
                            className="w-full bg-white/50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none font-light text-slate-800"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                        >
                            <option>Person</option>
                            <option>Hero</option>
                            <option>Scientist</option>
                            <option>Civilian Hero</option>
                            <option>Pet</option>
                            <option>Event</option>
                        </select>
                     </div>
                   </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                    <SectionTitle title="Select DIY Template" subtitle="Choose the atmosphere for the digital sanctuary." />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {MEMORIAL_TEMPLATES.map(template => (
                            <div 
                                key={template.id}
                                onClick={() => setFormData({...formData, templateId: template.id})}
                                className={`cursor-pointer group relative rounded-xl overflow-hidden border-2 transition-all duration-300 h-64 flex flex-col justify-end p-4 shadow-lg ${formData.templateId === template.id ? 'border-blue-500 scale-105 shadow-xl' : 'border-transparent opacity-80 hover:opacity-100'}`}
                            >
                                <img src={template.bgImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                
                                <div className="relative z-10">
                                   <div className={`w-full h-1 mb-2 rounded-full ${template.id === formData.templateId ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                                   <h3 className="font-serif text-lg text-white">{template.name}</h3>
                                   <p className="text-xs text-slate-300 line-clamp-2">{template.description}</p>
                                </div>
                                
                                {formData.templateId === template.id && (
                                   <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                      <Check size={12} />
                                   </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                   <SectionTitle title="Essence & Story" subtitle="Weaving the digital tapestry." />
                   
                   <TextArea 
                      label="Key Personality Traits" 
                      placeholder="e.g. Kind, lover of gardens, quiet strength..." 
                      className="min-h-[80px]"
                      value={formData.traits}
                      onChange={e => setFormData({...formData, traits: e.target.value})}
                   />
                   
                   <div className="flex justify-end -mt-2 mb-2">
                       <Button 
                        variant="ghost" 
                        onClick={handleGenerateBio} 
                        disabled={loadingAI}
                        className="text-xs"
                        icon={Sparkles}
                       >
                           {loadingAI ? 'Weaving words...' : 'Generate Bio with AI'}
                       </Button>
                   </div>

                   <TextArea 
                      label="Biography" 
                      placeholder="The story will appear here..." 
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                   />
                   
                   <div className="border-t border-slate-100 pt-6">
                      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 ml-1">Media Upload</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer">
                          <Upload className="mb-2" />
                          <span className="text-sm">Drag photos or videos here</span>
                          <span className="text-[10px] mt-1">Stored on IPFS</span>
                      </div>
                   </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center">
                    <SectionTitle title="Consecration" subtitle="Minting your eternal RWA Badge." />
                    <div className="flex justify-center mb-8 py-8">
                        <RWABadge id="PENDING-MINT-001" name={formData.name || 'Unknown'} />
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-2 px-4 rounded-full mx-auto max-w-xs mb-6 border border-emerald-100">
                        <Database size={14} />
                        <span className="text-xs font-mono">Writing to Block 19,234,112...</span>
                    </div>

                    <p className="text-sm text-slate-500 font-light max-w-md mx-auto mb-6">
                        This badge serves as the immutable on-chain proof. The initial setup includes 5 POM points to start their journey in the Remembrance Gallery.
                    </p>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                 <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1} className={currentStep === 1 ? 'invisible' : ''} icon={ArrowLeft}>
                    Back
                 </Button>
                 <Button onClick={handleNext} className="pl-8 pr-8">
                    {currentStep === 4 ? 'Finalize & Mint' : 'Next Step'}
                    {currentStep !== 4 && <ArrowRight size={16} />}
                 </Button>
              </div>

            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreatePage;