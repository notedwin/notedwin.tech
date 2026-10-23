// Generates every target of the design system from src/tokens.json (the one file anyone
// edits; copied from the design system artifact) and src/bundle.css (the artifact's component
// CSS). Outputs are committed so CSS-only and Python consumers need no build; `pnpm check`
// fails when they drift from the sources.
//
//   css/tokens.css       CSS variables for graphite (default) and smoke, plus .t-* type classes
//   css/theme.css        Tailwind v4 @theme block mapping utilities to the variables
//   css/components.css   the artifact's component CSS (ne-*), minus its Google Fonts import
//   css/fonts.css        @font-face for the self-hosted faces + Instrument Sans from Google Fonts
//   css/perspective.css  Perspective 5.5 themes "notedwin graphite" and "notedwin smoke"
//   python/.../data/     tokens.json and perspective.css for the Python package
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const tokens = JSON.parse(fs.readFileSync(path.join(root, "src/tokens.json"), "utf8"));
const header = (what) => `/* ${tokens.name} design system: ${what}. Generated from src/tokens.json by build/generate.mjs. Don't edit. */\n`;

const themes = tokens.color.themes.map((t) => t.id); // first theme is the default
const [primary, secondary] = themes;
const alias = (v) => (typeof v === "string" ? v.replace(/^\{(.+)\}$/, "var(--$1)") : v);
const themed = (v, theme) => alias(typeof v === "string" ? v : v[theme] ?? v[primary]);

// A color token's literal value in a theme, following {alias} references.
const colorTokens = new Map(tokens.color.tokens.map((t) => [t.name, t]));
export function literal(name, theme) {
	let t = colorTokens.get(name);
	if (!t) throw new Error(`unknown color token: ${name}`);
	let v = typeof t.value === "string" ? t.value : t.value[theme] ?? t.value[primary];
	let ref = /^\{(.+)\}$/.exec(v);
	return ref ? literal(ref[1], theme) : v;
}

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

// next/font exposes each face as --nf-*; without it (plain CSS, Perspective) the token stack applies.
const nextFontVar = { sans: "--nf-sans", mono: "--nf-mono", pixel: "--nf-pixel" };
const families = Object.entries(tokens.type.families)
	.map(([k, stack]) => `  --font-${k}: var(${nextFontVar[k]}, ${stack});`)
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

const tokensCss = `${header("CSS variables and type classes")}:root {
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
const themeCss = `${header("Tailwind v4 theme")}@theme inline {
  --color-*: initial;
${tokens.color.tokens.map((t) => `  --color-${t.name}: var(--${t.name});`).join("\n")}
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

// Dithered plates print in --dither-ink; a site may retune it per theme.
const componentsCss = `${header("component CSS (ne-*) from the artifact's bundle.css")}:root { --dither-ink: var(--flame-body); --dither-opacity: 0.9; }
${fs
	.readFileSync(path.join(root, "src/bundle.css"), "utf8")
	.replace(/^@import url\([^)]*fonts\.googleapis[^)]*\);\n/m, "")}
${fs.readFileSync(path.join(root, "src/parts.css"), "utf8")}`;

// Fonts for consumers without next/font. Paths are relative to css/.
const fontFaces = tokens.type.fonts
	.map(
		(f) =>
			`@font-face { font-family: "${f.family}"; src: url("../${f.file}") format("woff2"); font-weight: ${f.weight}; font-display: swap; }`
	)
	.join("\n");
const fontsCss = `${header("font faces")}@import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:wdth,wght@75..100,400..700&display=swap");
${fontFaces}
`;

// Perspective 5.5: two named themes in literal colors, so the file works on its own (Jupyter,
// a bare page) next to Perspective's base sheet. Palette rules from data-viz.md.
const perspectiveTheme = (name, theme) => {
	const c = (n) => literal(n, theme);
	// Categorical: infra, data, play; more series fall back to ink-muted and ink-faint.
	// data-viz.md names ash-500, but it's a fixed brand color at 2.8:1 on smoke, under the
	// 3:1 marks need; the two theme-tuned neutrals hold it in both themes.
	const series = [c("infra"), c("data"), c("play")];
	while (series.length < 12) series.push(series.length % 2 ? c("ink-muted") : c("ink-faint"));
	// Diverging: infra-ink (below) ↔ rule (zero) ↔ ember-ink (above).
	const gradient = `linear-gradient(${c("infra-ink")} 0%, ${c("rule")} 50%, ${c("ember-ink")} 100%)`;
	const shadow = tokens.shadow.tokens.find((t) => t.name === "shadow-float").value[theme];
	const vars = {
		"--psp--color": c("ink"),
		"--psp--background-color": c("ground-raised"),
		"--psp-active--color": c("link"),
		"--psp-active--background": c("infra-wash"),
		"--psp-error--color": c("signal-error"),
		"--psp-inactive--color": c("ink-muted"),
		"--psp-inactive--border-color": c("rule"),
		"--psp-warning--color": c("on-ink"),
		"--psp-warning--background": c("ink"),
		"--psp-placeholder--background": c("ground-sunk"),
		"--psp-select--background-color": c("ground-raised"),
		"--psp-dropdown--box-shadow": shadow,
		"--psp-interface-monospace--font-family": tokens.type.families.mono,
		"--psp-calendar--filter": theme === "dark" ? "invert(1)" : "initial",
		"--psp-input--filter": theme === "dark" ? "invert(1)" : "initial",
		"--psp-code-editor--column--color": c("infra-ink"),
		"--psp-code-editor--comment--color": c("ink-muted"),
		"--psp-code-editor--literal--color": c("ink"),
		"--psp-code-editor--operator--color": c("ink-muted"),
		"--psp-code-editor--symbol--color": c("ink"),
		"--psp-expression--function--color": c("infra-ink"),
		"--psp-expression--operator--color": c("ink-muted"),
		"--psp-expression--error--color": c("signal-error"),
		"--psp-status-icon--connected--color": c("signal-live"),
		"--psp-status-icon--initializing--color": c("signal-warn"),
		"--psp-status-icon--psp-error--color": c("signal-error"),
		"--psp-column-type--boolean--color": c("ink-muted"),
		"--psp-column-type--date--color": c("ink-muted"),
		"--psp-column-type--float--color": c("ink-muted"),
		"--psp-column-type--string--color": c("ink-muted"),
		"--psp-datagrid--border-color": c("rule"),
		"--psp-datagrid--hover--border-color": c("ink-faint"),
		// Cells stay quiet: the minus sign carries direction, so most of a grid isn't ember.
		"--psp-datagrid--pos-cell--color": c("ink"),
		"--psp-datagrid--neg-cell--color": c("infra-ink"),
		"--psp-charts--legend--color": c("ink-muted"),
		"--psp-charts--legend--background": c("ground-raised"),
		"--psp-charts--tooltip--color": c("ink"),
		"--psp-charts--tooltip--background": c("ground-raised"),
		"--psp-charts--tooltip--border-color": c("rule"),
		"--psp-charts--axis-ticks--color": c("ink-muted"),
		"--psp-charts--axis-lines--color": c("ink-faint"),
		"--psp-charts--gridline--color": c("rule"),
		"--psp-charts--treemap--labels": c("ink"),
		"--psp-charts--treemap--hover-highlight": c("ink"),
		"--psp-charts--series--color": series[0],
		"--psp-charts--gradient--background": gradient,
		"--psp-openlayers--element--background": c("ground-raised"),
		"--psp-openlayers--gradient--background": gradient,
	};
	series.forEach((s, i) => {
		vars[`--psp-charts--series-${i + 1}--color`] = s;
		vars[`--psp-datagrid--series-${i + 1}--color`] = s;
		if (i < 10) vars[`--psp-openlayers--category-${i + 1}--color`] = s;
	});
	const sel = `perspective-viewer[theme="${name}"], perspective-viewer [theme="${name}"]`;
	return `perspective-viewer, ${sel} { --psp-theme-name: "${name}"; }
${sel} {
  color: ${c("ink")};
  background-color: ${c("ground-raised")};
  color-scheme: ${theme === "dark" ? "dark" : "light"};
  font-family: ${tokens.type.families.mono};
${Object.entries(vars)
	.map(([k, v]) => `  ${k}: ${v};`)
	.join("\n")}
}`;
};
const perspectiveNames = { dark: "notedwin graphite", light: "notedwin smoke" };
const perspectiveCss = `${header("Perspective 5.5 themes; load after @perspective-dev/viewer's base theme CSS")}${perspectiveTheme(perspectiveNames[secondary], secondary)}
${perspectiveTheme(perspectiveNames[primary], primary)}
`;

// With --check, compare instead of writing and exit 1 on any drift (CI and `pnpm check`).
const checkOnly = process.argv.includes("--check");
const drifted = [];
const write = (rel, text) => {
	const file = path.join(root, rel);
	if (checkOnly) {
		if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text) drifted.push(rel);
		return;
	}
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, text);
};
process.on("exit", () => {
	if (!checkOnly) return;
	if (drifted.length) {
		console.error(`drift: regenerate with \`pnpm generate\` and commit:\n  ${drifted.join("\n  ")}`);
		process.exitCode = 1;
	} else {
		console.log("drift: generated files match src/tokens.json");
	}
});
write("css/tokens.css", tokensCss);
write("css/theme.css", themeCss);
write("css/components.css", componentsCss);
write("css/fonts.css", fontsCss);
write("css/perspective.css", perspectiveCss);
write("python/src/notedwin_design/data/tokens.json", fs.readFileSync(path.join(root, "src/tokens.json"), "utf8"));
write("python/src/notedwin_design/data/perspective.css", perspectiveCss);
write("python/src/notedwin_design/data/themes.json", JSON.stringify(perspectiveNames, null, 2) + "\n");
console.log(
	`generated: ${themedTokens.length} themed + ${staticTokens.length} static tokens, ${styles.length} type styles, 2 Perspective themes`
);
