import React, { createContext, useContext, useState } from 'react';

type DemoContextType = {
  isDemoRequested: boolean;
  selectedDemo: string;
  requestDemo: (demoName?: string) => void;
  closeDemo: () => void;
};

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoRequested, setIsDemoRequested] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState('');

  const requestDemo = (demoName: string = '') => {
    setSelectedDemo(demoName);
    setIsDemoRequested(true);
    // Scroll to demo section if not already there
    const demoSection = document.getElementById('product-demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const closeDemo = () => {
    setIsDemoRequested(false);
  };

  return (
    <DemoContext.Provider value={{ isDemoRequested, selectedDemo, requestDemo, closeDemo }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
