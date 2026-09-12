import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CONTENT } from '../data/content';

const STORAGE_KEY = 'rozhina.content.v1';

const isPlainObject = (v) => v != null && typeof v === 'object' && !Array.isArray(v);

const deepMerge = (base, patch) => {
  if (isPlainObject(base) && isPlainObject(patch)) {
    const out = { ...base };
    for (const key of Object.keys(patch)) {
      out[key] = deepMerge(base[key], patch[key]);
    }
    return out;
  }
  return patch === undefined ? base : patch;
};

const backfillShots = (merged) => {
  const defShots = CONTENT.lookbook?.shots ?? [];
  const cur = merged.lookbook ?? {};
  const shots = Array.isArray(cur.shots)
    ? cur.shots.map((s, i) => (s && !s.src && defShots[i] ? { ...s, src: defShots[i].src } : s))
    : cur.shots;
  return { ...merged, lookbook: { ...cur, shots } };
};

const readInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return backfillShots(deepMerge(CONTENT, parsed));
      }
    }
  } catch {
    /* corrupt store -> defaults */
  }
  return CONTENT;
};

const ContentContext = createContext(null);

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(readInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      /* private mode */
    }
  }, [content]);

  const updateContent = useCallback((patch) => {
    setContent((prev) => deepMerge(prev, patch));
  }, []);

  const replaceContent = useCallback((patch) => {
    setContent((prev) => backfillShots(deepMerge(CONTENT, deepMerge(prev, patch))));
  }, []);

  const resetContent = useCallback(() => setContent(CONTENT), []);

  const value = useMemo(
    () => ({ content, updateContent, replaceContent, resetContent }),
    [content, updateContent, replaceContent, resetContent],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
};