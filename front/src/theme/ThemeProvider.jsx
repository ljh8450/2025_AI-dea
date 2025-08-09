// src/theme/ThemeProvider.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const guessSeason = (d = new Date()) => {
	// 북반구 기준 간단 판정 (한국)
	const m = d.getMonth() + 1; // 1~12
	if (m === 12 || m <= 2) return 'winter';
	if (m >= 6 && m <= 8) return 'summer';
	return 'summer';
};

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(() => {
		const saved = localStorage.getItem('season-theme');
		return saved || guessSeason();
	});

	useEffect(() => {
		localStorage.setItem('season-theme', theme);
		document.documentElement.setAttribute('data-theme', theme);
	}, [theme]);

	const value = useMemo(() => ({ theme, setTheme }), [theme]);
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	return useContext(ThemeContext);
}
