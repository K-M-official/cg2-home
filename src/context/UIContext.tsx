import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface UIContextType {
  navbarVisible: boolean;
  setNavbarVisible: (visible: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [navbarVisible, setNavbarVisible] = useState(true);

  return (
    <UIContext.Provider value={{ navbarVisible, setNavbarVisible }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
