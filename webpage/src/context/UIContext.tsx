import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface UIContextType {
  navbarVisible: boolean;
  setNavbarVisible: (visible: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // 默认深色模式

  return (
    <UIContext.Provider value={{ navbarVisible, setNavbarVisible, isDarkMode, setIsDarkMode }}>
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
