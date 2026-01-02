import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { SHOP_ITEMS } from '../constants';

interface VirtualShopProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (item: any) => void;
  memorialType: string;
}

export const VirtualShop: React.FC<VirtualShopProps> = ({ isOpen, onClose, onPurchase, memorialType }) => {
  const [balance, setBalance] = useState(1000); // Mock balance for now

  // TODO: Replace with actual user authentication and balance check

  // Filter items based on memorial type (e.g., only show dog treats for pets)
  const items = SHOP_ITEMS.filter(item => {
    if (memorialType === 'Pet') return true; 
    return item.type !== 'toy' && item.type !== 'food';
  });

  const handleBuy = (item: any) => {
    // Simple mock check
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full lg:w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col pointer-events-auto"
            >
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
                <div>
                    <h3 className="font-serif text-xl">Offer Tribute</h3>
                    <p className="text-xs text-slate-400">Items increase POM Score & Rankings</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                {/* Balance Section */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex justify-between w-full items-center">
                        <div className="text-slate-700 text-sm">
                            Your Balance
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-bold text-sm">
                            {balance} Tokens
                        </div>
                    </div>
                </div>

                {/* Shop Grid */}
                <div className="p-6 grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto min-h-0">
                {items.map(item => (
                    <div key={item.id} className="border border-slate-100 rounded-xl p-4 flex flex-col items-center hover:shadow-lg transition-all hover:border-blue-200 group relative">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                    <h4 className="font-serif text-slate-800">{item.name}</h4>
                    <p className="text-[10px] text-slate-500 text-center mb-3 h-8">{item.description}</p>

                    <button
                        onClick={() => handleBuy(item)}
                        className="w-full bg-slate-900 text-white text-xs py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                    >
                        <span>{item.price} TKN</span>
                    </button>
                    </div>
                ))}
                </div>
                
                <div className="p-4 bg-slate-50 text-center text-[10px] text-slate-400 shrink-0">
                Proceeds support platform maintenance and memorial preservation.
                </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};