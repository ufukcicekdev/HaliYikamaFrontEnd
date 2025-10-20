'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  whatsapp_number: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  site_name: 'Halı Yıkama',
  site_description: 'Profesyonel temizlik hizmeti',
  contact_email: 'info@haliyikama.com',
  contact_phone: '0850 123 45 67',
  contact_address: 'İstanbul, Türkiye',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  whatsapp_number: '0530 123 45 67',
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use default settings for now
      // TODO: Integrate with SystemSettings API if needed
      setSettings(defaultSettings);
    } catch (err) {
      // Silently fail and use default settings
      setError('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchSettings();
    }
  }, [mounted]);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    // Return default values instead of throwing during SSR/build
    return {
      settings: defaultSettings,
      loading: false,
      error: null,
      refreshSettings: async () => {},
    };
  }
  return context;
}
