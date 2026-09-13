import { useEffect, useState } from 'react';

export const useIsMobile = () => {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const on = (e) => setMobile(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return mobile;
};