import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LOGO from './LOGO';
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';
import { StarryBackground } from './components/StarryBackground';

const Layout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 认证系统集成
  const { user, isAuthenticated, logout } = useAuth();

  // UI 控制
  const { navbarVisible } = useUI();

  // Check if we are on a dark themed page
  const isDarkPage = location.pathname === '/' || location.pathname === '/heritage' || location.pathname === '/auth' || location.pathname === '/profile';

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Heritage & Tokens', path: '/heritage' },
    { name: 'Create', path: '/create' },
  ];

  const getNavTextColor = () => {
    if (mobileMenuOpen) return 'text-slate-800';
    if (isScrolled) return 'text-slate-800';
    if (isDarkPage) return 'text-white/90';
    return 'text-slate-800';
  };
  
  const getNavBorderColor = () => {
      if (isScrolled) return 'border-slate-800';
      if (isDarkPage) return 'border-white';
      return 'border-slate-800';
  };

  const textColorClass = getNavTextColor();
  const borderColorClass = getNavBorderColor();

  return (
    <div className="flex flex-col min-h-screen font-sans relative">
      {/* 星空背景 - 全局常驻 */}
      {isDarkPage && <StarryBackground />}

      {/* Navbar - 根据 navbarVisible 控制显示 */}
      {navbarVisible && (
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}
        >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className={`cursor-pointer z-50 ${textColorClass} ${isDarkPage ? 'invert' : ''}`} onClick={() => navigate('/')}>
            <LOGO />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
             {navLinks.map(link => (
               <button 
                key={link.name} 
                onClick={() => navigate(link.path)}
                className={`text-xs uppercase tracking-widest hover:opacity-70 transition-opacity ${textColorClass}`}
               >
                 {link.name}
               </button>
             ))}
             {isAuthenticated && user ? (
               <div className="flex items-center gap-3">
                 <button
                   onClick={() => navigate('/profile')}
                   className={`px-4 py-2 rounded-full border text-xs uppercase tracking-widest ${borderColorClass} ${textColorClass} flex items-center gap-2 hover:bg-white/10 transition-all`}
                 >
                   <User size={14} />
                   {user.email.split('@')[0]}
                 </button>
                 <button
                   onClick={logout}
                   className={`px-4 py-2 rounded-full border text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center gap-2 ${borderColorClass} ${textColorClass}`}
                 >
                   <LogOut size={14} />
                   Logout
                 </button>
               </div>
             ) : (
               <button
                 onClick={() => navigate('/auth')}
                 className={`px-5 py-2 rounded-full border text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-2 ${borderColorClass} ${textColorClass}`}
               >
                 <User size={14} />
                 Login / Register
               </button>
             )}
          </div>

          {/* Mobile Toggle */}
          <button className={`md:hidden z-50 ${textColorClass}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center gap-8 md:hidden text-slate-800"
                >
                    {navLinks.map(link => (
                        <button 
                            key={link.name} 
                            onClick={() => navigate(link.path)}
                            className="font-serif text-3xl"
                        >
                            {link.name}
                        </button>
                    ))}
                    
                    {/* 移动端认证按钮 */}
                    {isAuthenticated && user ? (
                      <div className="flex flex-col items-center gap-4 mt-4">
                        <button
                          onClick={() => navigate('/profile')}
                          className="px-5 py-2 rounded-full border border-slate-800 text-xs uppercase tracking-widest flex items-center gap-2"
                        >
                          <User size={14} />
                          {user.email.split('@')[0]}
                        </button>
                        <button
                          onClick={logout}
                          className="px-5 py-2 rounded-full border border-slate-800 text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center gap-2"
                        >
                          <LogOut size={14} />
                          Logout
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate('/auth')}
                        className="px-5 py-2 rounded-full border border-slate-800 text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2 mt-4"
                      >
                        <User size={14} />
                        Login / Register
                      </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
         <div className="mx-auto px-6 grid md:grid-cols-4 gap-12">
             <div className="col-span-2">
                 <h2 className="font-serif text-2xl text-white mb-4">K&M ERA</h2>
                 <p className="font-light text-sm leading-relaxed max-w-sm opacity-80">
                     A tender-tech sanctuary for digital immortality. We believe memories deserve a home as permanent as the stars.
                 </p>
             </div>
             <div>
                 <h4 className="uppercase text-xs tracking-widest text-white mb-6">Product Lines</h4>
                 <ul className="space-y-4 text-sm font-light">
                     <li><button onClick={() => navigate('/create')} className="hover:text-white transition-colors">Cloud Memorial</button></li>
                     <li><button onClick={() => navigate('/gallery')} className="hover:text-white transition-colors">Remembrance Gallery</button></li>
                     <li><button onClick={() => navigate('/heritage')} className="hover:text-white transition-colors">Heritage Tokens</button></li>
                 </ul>
             </div>
             <div>
                 <h4 className="uppercase text-xs tracking-widest text-white mb-6">Legal</h4>
                 <ul className="space-y-4 text-sm font-light">
                     <li><button onClick={() => navigate('/about/privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                     <li><button onClick={() => navigate('/about/terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
                 </ul>
             </div>
         </div>
         <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-800 text-xs text-center font-light">
             &copy; 2024 K&M ERA. All memories reserved.
         </div>
      </footer>
    </div>
  );
};

export default Layout;
