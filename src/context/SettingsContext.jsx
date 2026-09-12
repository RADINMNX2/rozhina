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
import { fetchRemoteJs, notifyRemoteAttempt } from '../utils/remote';

export const DEFAULT_SETTINGS = {
  announcementText: ANNOUNCEMENT_TEXT,
  phone: PHONE_NUMBER,
  whatsapp: WHATSAPP_NUMBER,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  instagramHandle: INSTAGRAM_HANDLE,
  instagramUrl: INSTAGRAM_URL,
  supportId: SUPPORT_ID,
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS }));

  useEffect(() => {
    let alive = true;
    fetchRemoteJs(
      'src/data/constants.js',
      '({ whatsapp: WHATSAPP_NUMBER, instagramHandle: INSTAGRAM_HANDLE, instagramUrl: INSTAGRAM_URL, freeShippingThreshold: FREE_SHIPPING_THRESHOLD, announcementText: ANNOUNCEMENT_TEXT, phone: PHONE_NUMBER, supportId: SUPPORT_ID })',
    )
      .then((remote) => {
        if (!alive) return;
        if (remote && typeof remote === 'object') {
          setSettings((prev) => ({ ...prev, ...remote }));
        }
      })
      .catch(() => {})
      .finally(() => notifyRemoteAttempt());
    return () => {
      alive = false;
    };
  }, []);

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