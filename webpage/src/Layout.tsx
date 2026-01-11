import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LOGO from './LOGO';
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';
import { useWeb3 } from './context/Web3Context';
import { StarryBackground } from './components/StarryBackground';

const Layout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 认证系统集成
  const { user, isAuthenticated, logout } = useAuth();

  // UI 控制
  const { navbarVisible, isDarkMode } = useUI();

  // Web3 模式控制
  const { isWeb3Mode, toggleWeb3Mode, walletAddress, connectWallet, disconnectWallet } = useWeb3();

  // 判断哪些页面需要显示星空背景（排除浅色页面）
  const shouldShowStarryBg = isDarkMode && (
    location.pathname === '/' ||
    location.pathname === '/cloud-space' ||
    location.pathname === '/heritage' ||
    location.pathname === '/auth' ||
    location.pathname === '/profile'
  );

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
    { name: 'Cloud Space', path: '/cloud-space' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Heritage & Tokens', path: '/heritage' },
    { name: 'Create', path: '/create', hideInWeb3: true },
  ];

  const getNavTextColor = () => {
    if (mobileMenuOpen) return 'text-slate-800';
    if (isScrolled) return 'text-slate-800';
    if (shouldShowStarryBg) return 'text-white/90';
    return 'text-slate-800';
  };

  const getNavBorderColor = () => {
      if (isScrolled) return 'border-slate-800';
      if (shouldShowStarryBg) return 'border-white';
      return 'border-slate-800';
  };

  const textColorClass = getNavTextColor();
  const borderColorClass = getNavBorderColor();

  return (
    <div className="flex flex-col min-h-screen font-sans relative">
      {/* Navbar - 根据 navbarVisible 控制显示 */}
      {navbarVisible && (
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}
        >
        <div className="w-full px-4 lg:px-6 flex justify-between items-center overflow-hidden">
          <div className={`cursor-pointer z-50 flex-shrink-0 ${textColorClass} ${shouldShowStarryBg ? 'invert' : ''}`} onClick={() => navigate('/')}>
            <LOGO />
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex gap-2 items-center flex-shrink-0">
             {/* 导航链接 - 使用 CSS 响应式显示 */}
             <div className="hidden lg:flex gap-4 items-center">
               {navLinks.map(link => (
                 <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className={`text-xs uppercase tracking-widest hover:opacity-70 transition-opacity whitespace-nowrap ${textColorClass} ${isWeb3Mode && link.hideInWeb3 ? 'hidden' : ''}`}
                 >
                   {link.name}
                 </button>
               ))}
             </div>

             {isWeb3Mode ? (
               // Web3 模式：显示钱包连接
               walletAddress ? (
                 <div className="flex items-center gap-2">
                   <button
                     className={`px-3 py-2 rounded-full border text-xs uppercase tracking-widest ${borderColorClass} ${textColorClass} flex items-center gap-2`}
                   >
                     <Wallet size={14} />
                     {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                   </button>
                   <button
                     onClick={disconnectWallet}
                     className={`px-3 py-2 rounded-full border text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center gap-2 ${borderColorClass} ${textColorClass}`}
                   >
                     <LogOut size={14} />
                     <span className="hidden lg:inline">Disconnect</span>
                   </button>
                 </div>
               ) : (
                 <button
                   onClick={connectWallet}
                   className={`px-4 py-2 rounded-full border text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all flex items-center gap-2 ${borderColorClass} ${textColorClass}`}
                 >
                   <Wallet size={14} />
                   Connect
                 </button>
               )
             ) : (
               // 普通模式：显示邮箱登录
               isAuthenticated && user ? (
                 <div className="flex items-center gap-2">
                   <button
                     onClick={() => navigate('/profile')}
                     className={`px-3 py-2 rounded-full border text-xs uppercase tracking-widest ${borderColorClass} ${textColorClass} flex items-center gap-2 hover:bg-white/10 transition-all`}
                   >
                     <User size={14} />
                     <span className="hidden lg:inline">{user.email.split('@')[0]}</span>
                   </button>
                   <button
                     onClick={logout}
                     className={`px-3 py-2 rounded-full border text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center gap-2 ${borderColorClass} ${textColorClass}`}
                   >
                     <LogOut size={14} />
                     <span className="hidden lg:inline">Logout</span>
                   </button>
                 </div>
               ) : (
                 <button
                   onClick={() => navigate('/auth')}
                   className={`px-4 py-2 rounded-full border text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-2 ${borderColorClass} ${textColorClass}`}
                 >
                   <User size={14} />
                   <span className="hidden lg:inline">Login / Register</span>
                 </button>
               )
             )}

             {/* Web3 Mode Toggle - 移到最右侧 */}
             <button
               onClick={toggleWeb3Mode}
               className={`p-2 rounded-full border transition-all ${borderColorClass} ${textColorClass} ${isWeb3Mode ? 'bg-indigo-500/20 border-indigo-400' : 'hover:bg-white/10'}`}
               title={isWeb3Mode ? 'Switch to Normal Mode' : 'Switch to Web3 Mode'}
             >
               <Wallet size={18} />
             </button>
          </div>

          {/* Mobile Toggle */}
          <button className={`max-lg:block hidden z-50 ${textColorClass}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
                    className="absolute top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center gap-8 max-lg:flex lg:hidden text-slate-800"
                >
                    {navLinks.map(link => (
                        <button
                            key={link.name}
                            onClick={() => navigate(link.path)}
                            className={`font-serif text-3xl ${isWeb3Mode && link.hideInWeb3 ? 'hidden' : ''}`}
                        >
                            {link.name}
                        </button>
                    ))}

                    {/* Web3 Mode Toggle - Mobile */}
                    <button
                      onClick={toggleWeb3Mode}
                      className={`px-5 py-2 rounded-full border border-slate-800 text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${isWeb3Mode ? 'bg-indigo-500 text-white border-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                      <Wallet size={14} />
                      {isWeb3Mode ? 'Web3 Mode' : 'Normal Mode'}
                    </button>

                    {/* 移动端认证按钮 */}
                    {isWeb3Mode ? (
                      // Web3 模式 - 移动端
                      walletAddress ? (
                        <div className="flex flex-col items-center gap-4 mt-4">
                          <button className="px-5 py-2 rounded-full border border-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                            <Wallet size={14} />
                            {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                          </button>
                          <button
                            onClick={disconnectWallet}
                            className="px-5 py-2 rounded-full border border-slate-800 text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center gap-2"
                          >
                            <LogOut size={14} />
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={connectWallet}
                          className="px-5 py-2 rounded-full border border-slate-800 text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all flex items-center gap-2 mt-4"
                        >
                          <Wallet size={14} />
                          Connect Wallet
                        </button>
                      )
                    ) : (
                      // 普通模式 - 移动端
                      isAuthenticated && user ? (
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
                    )
                  )}
                </motion.div>
            )}
        </AnimatePresence>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {/* 星空背景 - 只在深色页面显示 */}
        {shouldShowStarryBg && <StarryBackground />}
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-4 gap-12">
             <div className="col-span-2">
                 <h2 className="font-serif text-2xl text-white mb-4">K&M ERA</h2>
                 <p className="font-light text-sm leading-relaxed max-w-sm opacity-80">
                     A tender-tech sanctuary for digital immortality. We believe memories deserve a home as permanent as the stars.
                 </p>
             </div>
             <div>
                 <h4 className="uppercase text-xs tracking-widest text-white mb-6">Product Lines</h4>
                 <ul className="space-y-4 text-sm font-light">
                     <li><button onClick={() => navigate('/cloud-space')} className="hover:text-white transition-colors">Cloud Space</button></li>
                     <li><button onClick={() => navigate('/gallery')} className="hover:text-white transition-colors">Gallery</button></li>
                     <li><button onClick={() => navigate('/heritage')} className="hover:text-white transition-colors">Heritage</button></li>
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
