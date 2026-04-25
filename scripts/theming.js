const STORAGE_KEY = 'theme';
const CYCLE = ['system', 'light', 'dark'];
const LABELS = {
	system: 'Theme: follows system. Click to switch to light.',
	light: 'Theme: light. Click to switch to dark.',
	dark: 'Theme: dark. Click to switch to system.',
};
const ANNOUNCEMENTS = {
	system: 'Theme set to system default.',
	light: 'Theme set to light.',
	dark: 'Theme set to dark.',
};

const readTheme = () => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return CYCLE.includes(stored) ? stored : 'system';
	} catch {
		return 'system';
	}
};

const applyTheme = (theme) => {
	const root = document.documentElement;
	if (theme === 'system') {
		root.removeAttribute('data-theme');
	} else {
		root.setAttribute('data-theme', theme);
	}
	try {
		if (theme === 'system') localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, theme);
	} catch {}
};

const updateButton = (button, theme) => {
	button.setAttribute('aria-label', LABELS[theme]);
};

const nextTheme = (current) => CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];

const init = () => {
	const button = document.querySelector('#ctrl-theme');
	if (!button) return;

	const announcer = document.querySelector('#theme-announce');
	let current = readTheme();
	updateButton(button, current);

	button.addEventListener('click', () => {
		current = nextTheme(current);
		applyTheme(current);
		updateButton(button, current);
		if (announcer) announcer.textContent = ANNOUNCEMENTS[current];
	});
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
