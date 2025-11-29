import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LOGO from './LOGO';
import { usePhantomWallet } from './hooks/usePhantomWallet';

const Layout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Phantom钱包集成
  const { 
    walletAddress, 
    isConnecting, 
    error, 
    connectWallet, 
    disconnectWallet, 
    formatAddress 
  } = usePhantomWallet();
  
  // Check if we are on a dark themed page
  const isDarkPage = location.pathname === '/' || location.pathname === '/heritage';

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
    <div className="flex flex-col min-h-screen font-sans">
      
      {/* Navbar */}
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
             {walletAddress ? (
               <div className="flex items-center gap-3">
                 <div className={`px-4 py-2 rounded-full border text-xs uppercase tracking-widest ${borderColorClass} ${textColorClass} flex items-center gap-2`}>
                   <Wallet size={14} />
                   {formatAddress}
                 </div>
                 <button 
                   onClick={disconnectWallet}
                   className={`px-4 py-2 rounded-full border text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all ${borderColorClass} ${textColorClass}`}
                 >
                   断开
                 </button>
               </div>
             ) : (
               <button 
                 onClick={connectWallet}
                 disabled={isConnecting}
                 className={`px-5 py-2 rounded-full border text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-2 ${borderColorClass} ${textColorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
               >
                 {isConnecting ? (
                   <>
                     <span className="animate-spin">⟳</span>
                     连接中...
                   </>
                 ) : (
                   <>
                     <Wallet size={14} />
                     Connect Wallet
                   </>
                 )}
               </button>
             )}
             {error && (
               <div className="absolute top-full mt-2 right-0 bg-red-500 text-white text-xs px-4 py-2 rounded shadow-lg">
                 {error}
               </div>
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
                    
                    {/* 移动端钱包按钮 */}
                    {walletAddress ? (
                      <div className="flex flex-col items-center gap-4 mt-4">
                        <div className="px-5 py-2 rounded-full border border-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                          <Wallet size={14} />
                          {formatAddress}
                        </div>
                        <button 
                          onClick={disconnectWallet}
                          className="px-5 py-2 rounded-full border border-slate-800 text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                        >
                          断开连接
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="px-5 py-2 rounded-full border border-slate-800 text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2 mt-4 disabled:opacity-50"
                      >
                        {isConnecting ? (
                          <>
                            <span className="animate-spin">⟳</span>
                            连接中...
                          </>
                        ) : (
                          <>
                            <Wallet size={14} />
                            Connect Wallet
                          </>
                        )}
                      </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800">
         <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
             <div className="col-span-2">
                 <h2 className="font-serif text-2xl text-white mb-4">K&M ERA</h2>
                 <p className="font-light text-sm leading-relaxed max-w-sm">
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
                     <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Terms of Eternity</a></li>
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
