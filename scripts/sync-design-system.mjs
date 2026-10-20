// Generates app/styles/{tokens,theme,bundle}.css from the vendored
// design system in design-system/ (tokens.json + bundle.css from the notedwin
// design system artifact). Re-sync: replace those two files, run `pnpm tokens`.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "design-system");
const out = path.join(root, "app/styles");
const tokens = JSON.parse(fs.readFileSync(path.join(src, "tokens.json"), "utf8"));

const themes = tokens.color.themes.map((t) => t.id); // first theme is the default
const [primary, secondary] = themes;
const alias = (v) => (typeof v === "string" ? v.replace(/^\{(.+)\}$/, "var(--$1)") : v);
const themed = (v, theme) => alias(typeof v === "string" ? v : v[theme] ?? v[primary]);

// Theme-dependent families: color, plus any other family whose values are per-theme (shadow).
const themedTokens = [
	...tokens.color.tokens,
	...Object.entries(tokens)
		.filter(([k, f]) => k !== "color" && f?.tokens?.some((t) => typeof t.value === "object"))
		.flatMap(([, f]) => f.tokens),
];
const staticTokens = Object.entries(tokens)
	.filter(([k, f]) => k !== "color" && k !== "type" && Array.isArray(f?.tokens))
	.flatMap(([, f]) => f.tokens)
	.filter((t) => typeof t.value !== "object");

const block = (theme, indent) =>
	themedTokens.map((t) => `${indent}--${t.name}: ${themed(t.value, theme)};`).join("\n");

// next/font exposes each face as a CSS variable on <html>; the token stack stays as the fallback.
const nextFontVar = { sans: "--nf-sans", mono: "--nf-mono", pixel: "--nf-pixel" };
const families = Object.entries(tokens.type.families)
	.map(([k, stack]) => `  --font-${k}: var(${nextFontVar[k]}), ${stack};`)
	.join("\n");

const styles = tokens.type.groups.flatMap((g) =>
	g.styles.map((s) => {
		const decl = [
			`font-family: var(--font-${g.family})`,
			`font-size: ${s.fontSize}`,
			`line-height: ${s.lineHeight}`,
			`font-weight: ${s.fontWeight}`,
			s.letterSpacing && `letter-spacing: ${s.letterSpacing}`,
			g.family === "pixel" && s.name.startsWith("metric") && "font-variant-numeric: tabular-nums",
			s.name === "label" && "text-transform: lowercase",
		].filter(Boolean);
		return `.t-${s.name} { ${decl.join("; ")}; }`;
	})
);

const css = `/* ${tokens.name} v${tokens.version}: generated from design-system/tokens.json by scripts/sync-design-system.mjs. Don't edit. */
:root {
${block(primary, "  ")}
  color-scheme: dark;
}
@media (prefers-color-scheme: light) {
  :root:not([data-theme="${primary}"]) {
${block(secondary, "    ")}
    color-scheme: light;
  }
}
:root[data-theme="${secondary}"] {
${block(secondary, "  ")}
  color-scheme: light;
}
:root {
${families}
${staticTokens.map((t) => `  --${t.name}: ${t.value};`).join("\n")}
}
${styles.join("\n")}
`;

// Tailwind v4 theme: utilities resolve to the token variables, so `bg-ground` follows the theme.
const breakpoints = { sm: "480px", md: "768px", lg: "1024px", xl: "1280px" }; // README → Finishing details
const theme = `/* Tailwind v4 theme generated from design-system/tokens.json by scripts/sync-design-system.mjs. Don't edit. */
@theme inline {
  --color-*: initial;
${themedTokens
	.filter((t) => tokens.color.tokens.includes(t))
	.map((t) => `  --color-${t.name}: var(--${t.name});`)
	.join("\n")}
  --font-*: initial;
${Object.keys(tokens.type.families)
	.map((k) => `  --font-${k}: var(--font-${k});`)
	.join("\n")}
  --spacing: 4px;
  --radius-*: initial;
${tokens.radius.tokens.map((t) => `  --${t.name}: var(--${t.name});`).join("\n")}
  --breakpoint-*: initial;
${Object.entries(breakpoints)
	.map(([k, v]) => `  --breakpoint-${k}: ${v};`)
	.join("\n")}
  --text-*: initial;
${tokens.type.groups
	.flatMap((g) => g.styles)
	.map(
		(s) =>
			`  --text-${s.name}: ${s.fontSize};\n  --text-${s.name}--line-height: ${s.lineHeight};\n  --text-${s.name}--font-weight: ${s.fontWeight};`
	)
	.join("\n")}
  --container-measure: var(--measure);
  --container-column: var(--column);
}
`;

const bundle = fs
	.readFileSync(path.join(src, "bundle.css"), "utf8")
	.replace(/^@import url\([^)]*fonts\.googleapis[^)]*\);\n/m, "");

fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "tokens.css"), css);
fs.writeFileSync(path.join(out, "theme.css"), theme);
fs.writeFileSync(
	path.join(out, "bundle.css"),
	`/* Vendored from design-system/bundle.css by scripts/sync-design-system.mjs. Don't edit; override in global.css. */\n${bundle}`
);
console.log(`tokens.css: ${themedTokens.length} themed, ${staticTokens.length} static, ${styles.length} type styles`);
