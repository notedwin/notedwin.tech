// Theme plumbing that runs anywhere (server, client, plain script). No React.

export type ThemeMode = "dark" | "light";

// localStorage key for a reader's explicit choice. With none, the system setting applies.
export const THEME_KEY = "nw-theme";

// Put in <head> as an inline script: applies a saved theme before first paint, so nothing flashes.
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

// Perspective theme names registered by css/perspective.css.
export const PERSPECTIVE_THEMES: Record<ThemeMode, string> = {
	dark: "notedwin graphite",
	light: "notedwin smoke",
};

// The active page theme: an explicit data-theme, else the system setting. Browser only.
export function currentTheme(): ThemeMode {
	let explicit = document.documentElement.dataset.theme;
	if (explicit === "dark" || explicit === "light") return explicit;
	return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

// Fires when the theme changes, by toggle (data-theme) or by the system setting. Browser only.
export function onThemeChange(cb: () => void) {
	let observer = new MutationObserver(cb);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
	let media = matchMedia("(prefers-color-scheme: light)");
	media.addEventListener("change", cb);
	return () => {
		observer.disconnect();
		media.removeEventListener("change", cb);
	};
}
