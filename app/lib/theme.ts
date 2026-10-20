export const THEME_KEY = "nw-theme";

// Runs in <head> before first paint so a returning reader never sees the wrong theme.
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t)document.documentElement.dataset.theme=t}catch(e){}`;
