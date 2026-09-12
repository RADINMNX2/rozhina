import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ANNOUNCEMENT_TEXT,
  FREE_SHIPPING_THRESHOLD,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  PHONE_NUMBER,
  SUPPORT_ID,
  WHATSAPP_NUMBER,
} from '../data/constants';

const STORAGE_KEY = 'rozhina.settings.v1';

export const DEFAULT_SETTINGS = {
  announcementText: ANNOUNCEMENT_TEXT,
  phone: PHONE_NUMBER,
  whatsapp: WHATSAPP_NUMBER,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  instagramHandle: INSTAGRAM_HANDLE,
  instagramUrl: INSTAGRAM_URL,
  supportId: SUPPORT_ID,
};

const readInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    }
  } catch {
    /* corrupt store -> defaults */
  }
  return { ...DEFAULT_SETTINGS };
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(readInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* private mode */
    }
  }, [settings]);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const replaceSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch }));
  }, []);

  const resetToDefaults = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), []);

  const value = useMemo(
    () => ({ settings, updateSettings, replaceSettings, resetToDefaults }),
    [settings, updateSettings, replaceSettings, resetToDefaults],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};