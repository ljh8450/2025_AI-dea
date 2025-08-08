import { useEffect, useState } from 'react';

const KEY = 'ui:variant'; // 'light' | 'dark'

export function useThemeVariant() {
  const [variant, setVariant] = useState(localStorage.getItem(KEY) || 'light');
  useEffect(() => { localStorage.setItem(KEY, variant); }, [variant]);
  const toggleVariant = () => setVariant(v => (v === 'light' ? 'dark' : 'light'));
  return { variant, toggleVariant };
}
