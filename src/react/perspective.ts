import { useEffect, useState } from "react";
import { currentTheme, onThemeChange, PERSPECTIVE_THEMES } from "../theme";

// The Perspective theme name matching the page theme, updating when it changes:
// <perspective-viewer theme={usePerspectiveTheme()} />. Load css/perspective.css after
// @perspective-dev/viewer's base theme CSS.
export function usePerspectiveTheme() {
	let [name, setName] = useState(PERSPECTIVE_THEMES.dark);
	useEffect(() => {
		let sync = () => setName(PERSPECTIVE_THEMES[currentTheme()]);
		sync();
		return onThemeChange(sync);
	}, []);
	return name;
}
