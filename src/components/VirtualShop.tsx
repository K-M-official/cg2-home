import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Heart, Gift } from 'lucide-react';
import { SHOP_ITEMS } from '../constants';
import { Button } from './UI';

interface VirtualShopProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (item: any) => void;
  memorialType: string;
}

export const VirtualShop: React.FC<VirtualShopProps> = ({ isOpen, onClose, onPurchase, memorialType }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [balance, setBalance] = useState(0);

  // Filter items based on memorial type (e.g., only show dog treats for pets)
  const items = SHOP_ITEMS.filter(item => {
    if (memorialType === 'Pet') return true; 
    return item.type !== 'toy' && item.type !== 'food';
  });

  const handleConnect = () => {
    // Mock connection
    setTimeout(() => {
      setWalletConnected(true);
      setBalance(150); // Mock tokens
    }, 800);
  };

  const handleBuy = (item: any) => {
    if (balance >= item.price) {
      setBalance(b => b - item.price);
      onPurchase(item);
    } else {
      alert("Insufficient Tokens. Please top up.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[600px] bg-white rounded-2xl z-50 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-serif text-xl">Offer Tribute</h3>
                <p className="text-xs text-slate-400">Items increase POM Score & Rankings</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>

            {/* Wallet Section */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              {!walletConnected ? (
                <Button variant="primary" onClick={handleConnect} className="w-full text-sm py-2" icon={Wallet}>
                  Connect Wallet to Purchase
                </Button>
              ) : (
                <div className="flex justify-between w-full items-center">
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-mono text-sm">0x...8A2</span>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-bold text-sm">
                    {balance} Tokens
                  </div>
                </div>
              )}
            </div>

            {/* Shop Grid */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="border border-slate-100 rounded-xl p-4 flex flex-col items-center hover:shadow-lg transition-all hover:border-blue-200 group relative">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                  <h4 className="font-serif text-slate-800">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 text-center mb-3 h-8">{item.description}</p>
                  
                  {walletConnected ? (
                     <button 
                       onClick={() => handleBuy(item)}
                       className="w-full bg-slate-900 text-white text-xs py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                     >
                       <span>{item.price} TKN</span>
                     </button>
                  ) : (
                    <div className="text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1 rounded-full">{item.price} TKN</div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-slate-50 text-center text-[10px] text-slate-400">
               Secure Payment powered by K&M Protocol. Proceeds support platform maintenance.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};