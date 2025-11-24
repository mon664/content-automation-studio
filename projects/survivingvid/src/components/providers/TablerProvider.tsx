'use client';

import React, { createContext, useContext, useEffect } from 'react';

interface TablerContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const TablerContext = createContext<TablerContextType | undefined>(undefined);

export const useTabler = () => {
  const context = useContext(TablerContext);
  if (context === undefined) {
    throw new Error('useTabler must be used within a TablerProvider');
  }
  return context;
};

interface TablerProviderProps {
  children: React.ReactNode;
}

export const TablerProvider: React.FC<TablerProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 다크 모드 설정 확인
    const savedTheme = localStorage.getItem('tabler-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // 테마 적용
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('tabler-theme', theme);
  }, [theme]);

  return (
    <TablerContext.Provider value={{ theme, setTheme }}>
      {children}
    </TablerContext.Provider>
  );
};