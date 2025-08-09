// src/components/ThemeSwitcher.jsx
import { useTheme } from '../theme/ThemeProvider';

export default function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	return (
		<div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl shadow px-3 py-2 bg-[var(--card)] backdrop-blur">
			<span className="text-sm text-[var(--muted)]">현재: {theme}</span>
			<button
				className="px-3 py-1 rounded-lg border border-[var(--primary)] text-[var(--fg)]"
				onClick={() => setTheme('summer')}
			>
				여름
			</button>
			<button
				className="px-3 py-1 rounded-lg border border-[var(--primary)] text-[var(--fg)]"
				onClick={() => setTheme('winter')}
			>
				겨울
			</button>
		</div>
	);
}
