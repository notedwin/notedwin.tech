"use client";

import { THEME_KEY } from "../theme";

// Labelled with the current theme in plain words (dark or light); the accessible name adds what a
// press does. Both labels are rendered and components.css shows the right one, so server and
// client markup match.
export function ThemeToggle() {
	let toggle = () => {
		let root = document.documentElement;
		let light = root.dataset.theme
			? root.dataset.theme === "light"
			: matchMedia("(prefers-color-scheme: light)").matches;
		let next = light ? "dark" : "light";
		root.dataset.theme = next;
		try {
			localStorage.setItem(THEME_KEY, next);
		} catch {}
		let ground = getComputedStyle(root).getPropertyValue("--ground").trim();
		document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", ground));
	};
	return (
		<button className="ne-theme" type="button" onClick={toggle}>
			<i aria-hidden="true" />
			<span data-when="dark">
				<span className="ne-sr-only">theme: </span>dark<span className="ne-sr-only">, switch to light</span>
			</span>
			<span data-when="light">
				<span className="ne-sr-only">theme: </span>light<span className="ne-sr-only">, switch to dark</span>
			</span>
		</button>
	);
}
