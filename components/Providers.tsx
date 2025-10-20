'use client';

import { ReactNode } from 'react';
import { SiteSettingsProvider } from '@/lib/contexts/SiteSettingsContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SiteSettingsProvider>
      {children}
    </SiteSettingsProvider>
  );
}
