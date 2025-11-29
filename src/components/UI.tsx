import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

// --- FadeIn Wrapper ---
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}
export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className = "" }) => {
  const [isInteractive, setIsInteractive] = React.useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
      onAnimationComplete={() => setIsInteractive(true)}
      style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
    >
      {children}
    </motion.div>
  );
};

// --- Tender Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  icon?: LucideIcon;
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon: Icon, className = "", ...props }) => {
  const baseStyle = "px-6 py-3 rounded-full font-sans tracking-wide transition-all duration-500 ease-out flex items-center justify-center gap-2 text-sm";
  
  const variants = {
    primary: "bg-slate-800 text-white hover:bg-slate-700 shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5",
    secondary: "bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/40",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon size={16} className="opacity-70" />}
      {children}
    </button>
  );
};

// --- Glass Card ---
export const Card: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`glass-panel rounded-2xl p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

// --- Tech Card (Web3 Feel) ---
export const TechCard: React.FC<{ children: ReactNode; className?: string; title?: string }> = ({ children, className = "", title }) => (
  <div className={`relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-6 shadow-sm overflow-hidden group ${className}`}>
     {/* Tech Lines */}
     <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-lavender-300 to-transparent opacity-50"></div>
     <div className="absolute bottom-0 right-0 w-24 h-[1px] bg-slate-400/30"></div>
     <div className="absolute top-4 right-4 w-2 h-2 border border-slate-300/50 rounded-full"></div>
     
     {title && <h4 className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
        {title}
     </h4>}
     <div className="relative z-10">
        {children}
     </div>
  </div>
);

// --- Section Title ---
export const SectionTitle: React.FC<{ title: string; subtitle?: string; light?: boolean; className?: string }> = ({ title, subtitle, light = false, className = "" }) => (
  <div className={`text-center  ${className || 'mb-12'}`}>
    <h2 className={`font-serif text-3xl md:text-4xl mb-3 ${light ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
    {subtitle && <p className={`font-light tracking-wide ${light ? 'text-slate-300' : 'text-slate-500'}`}>{subtitle}</p>}
  </div>
);

// --- Input Field ---
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className = "", ...props }) => (
  <div className="mb-4">
    <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 ml-1">{label}</label>
    <input 
      className={`w-full bg-white/50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white transition-all font-light text-slate-800 ${className}`}
      {...props}
    />
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, className = "", ...props }) => (
  <div className="mb-4">
    <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 ml-1">{label}</label>
    <textarea 
      className={`w-full bg-white/50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white transition-all font-light text-slate-800 min-h-[120px] resize-none ${className}`}
      {...props}
    />
  </div>
);
