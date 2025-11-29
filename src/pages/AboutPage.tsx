import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FadeIn, SectionTitle } from '../components/UI';
import { ArrowLeft } from 'lucide-react';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="mb-8">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
            >
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
            </button>
            <SectionTitle title="About K&M ERA" subtitle="Transparency, Trust, and Forever." />
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-3">
            <nav className="flex flex-col space-y-2 sticky top-24">
              <NavLink 
                to="/about/privacy" 
                className={({ isActive }) => 
                  `px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`
                }
              >
                Privacy Policy
              </NavLink>
              <NavLink 
                to="/about/terms" 
                className={({ isActive }) => 
                  `px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`
                }
              >
                Terms of Service
              </NavLink>
            </nav>
          </div>

          {/* Content Area */}
          <div className="md:col-span-9">
            <FadeIn>
              <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100 min-h-[60vh]">
                <Outlet />
              </div>
            </FadeIn>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;

