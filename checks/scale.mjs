// Checks component CSS against two written rules (README "Shape and spacing", "Typography"):
//   - spacing (padding, margin, gap, inset) uses only the space-* steps: 0 or a step, in px or var()
//   - the pixel face (--font-pixel) is set only at 11, 22 or 33px
// Scans css/components.css by default; pass other files to check them too (a site's own CSS).
// 1px is allowed (hairline insets, the sr-only clip). Rules listed in KNOWN are components that
// don't render on notedwin.tech (the dashboard's, and the paper props); they still print, but
// don't fail the check. Fix them where they're used and drop them from the list.
// Exits 1 on any other finding.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const tokens = JSON.parse(fs.readFileSync(path.join(root, "src/tokens.json"), "utf8"));
const steps = new Set([0, ...tokens.spacing.tokens.map((t) => parseFloat(t.value))]);
const PIXEL = new Set([11, 22, 33]);

const KNOWN = new Set([
	".ne-notes",
	".ne-decide",
	".ne-conseq > div",
	".ne-log li",
	".ne-tabs button",
]);

const SPACING = /^(padding|margin|gap|row-gap|column-gap|inset)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/;

const files = process.argv.length > 2 ? process.argv.slice(2).map((f) => path.resolve(f)) : [path.join(root, "css/components.css")];
let failures = 0;
let known = 0;

for (const file of files) {
	const css = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
	for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const selector = m[1].trim().replace(/\s+/g, " ");
		if (selector.startsWith("@")) continue;
		const line = css.slice(0, m.index + m[0].length - m[2].length).split("\n").length;
		const decls = [...m[2].matchAll(/([a-z-]+)\s*:\s*([^;]+)/g)].map(([, p, v]) => [p, v.trim()]);
		const problems = [];
		for (const [prop, value] of decls) {
			if (SPACING.test(prop)) {
				const off = [...value.matchAll(/(?<![\w.-])(-?\d*\.?\d+)px/g)].map((v) => Math.abs(parseFloat(v[1]))).filter((v) => v !== 1 && !steps.has(v));
				if (off.length) problems.push(`${prop}: ${value} (${off.join(", ")}px off the scale)`);
			}
		}
		const pixel = decls.some(([p, v]) => (p === "font-family" || p === "font") && v.includes("--font-pixel"));
		if (pixel) {
			const font = decls.find(([p]) => p === "font")?.[1];
			const size = decls.findLast(([p]) => p === "font-size")?.[1] ?? font?.match(/(\d+)px/)?.[0];
			if (size && size.endsWith("px") && !PIXEL.has(parseFloat(size))) problems.push(`pixel face at ${size} (only 11, 22 or 33px)`);
		}
		if (!problems.length) continue;
		const isKnown = selector.split(",").every((s) => KNOWN.has(s.trim()));
		for (const p of problems) console.log(`${isKnown ? "known" : "FAIL "}  ${path.relative(process.cwd(), file)}:${line}  ${selector}  ${p}`);
		if (isKnown) known += problems.length;
		else failures += problems.length;
	}
}

console.log(`scale: ${failures} failing, ${known} known (not on the site)`);
process.exit(failures ? 1 : 0);
