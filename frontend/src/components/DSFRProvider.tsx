'use client';

import { useEffect } from 'react';

export default function DSFRProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Supprimer les messages de console DSFR en mode production
    if (process.env.NODE_ENV === 'production') {
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('dsfr')) {
          return;
        }
        originalConsoleLog.apply(console, args);
      };
    }
  }, []);

  return <>{children}</>;
} 