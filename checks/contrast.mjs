// Checks the shipped Perspective themes (css/perspective.css), not the token file, against the
// design system's accessibility rules, in both themes:
//   - text 4.5:1 (WCAG 2) on the surface it sits on
//   - marks (series, axis lines) 3:1 on the plot background
//   - the three domain series stay apart under normal vision and protan, deutan and tritan
//     simulation (Machado 2009, severity 1): ΔE2000 ≥ 20, as rationale.md reports for domains
// Exits 1 on any failure.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const css = fs.readFileSync(path.join(root, "css/perspective.css"), "utf8");

const themes = {};
for (const [, name, body] of css.matchAll(/perspective-viewer\[theme="([^"]+)"\][^{]*\{([^}]*color-scheme[^}]*)\}/g)) {
	themes[name] = Object.fromEntries([...body.matchAll(/(--psp-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (h) => {
	const [r, g, b] = hex(h).map(lin);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
	const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
	return (x + 0.05) / (y + 0.05);
};

// Machado 2009 matrices (severity 1.0), applied in linear RGB.
const CVD = {
	normal: null,
	protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
	deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
	tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};
const toLab = (h, m) => {
	let rgb = hex(h).map(lin);
	if (m) rgb = m.map((row) => Math.min(1, Math.max(0, row[0] * rgb[0] + row[1] * rgb[1] + row[2] * rgb[2])));
	const [r, g, b] = rgb;
	const xyz = [
		(0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047,
		0.2126 * r + 0.7152 * g + 0.0722 * b,
		(0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883,
	].map((t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116));
	return [116 * xyz[1] - 16, 500 * (xyz[0] - xyz[1]), 200 * (xyz[1] - xyz[2])];
};
// CIEDE2000.
const deltaE = ([L1, a1, b1], [L2, a2, b2]) => {
	const rad = Math.PI / 180;
	const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
	const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
	const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
	const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
	const h = (b, a) => (a === 0 && b === 0 ? 0 : (Math.atan2(b, a) / rad + 360) % 360);
	const h1p = h(b1, a1p), h2p = h(b2, a2p);
	const dLp = L2 - L1, dCp = C2p - C1p;
	let dhp = C1p * C2p === 0 ? 0 : h2p - h1p;
	if (dhp > 180) dhp -= 360;
	if (dhp < -180) dhp += 360;
	const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
	const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
	let hbp = h1p + h2p;
	if (C1p * C2p !== 0) hbp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + (h1p + h2p < 360 ? 360 : -360)) / 2 : (h1p + h2p) / 2;
	const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad) + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
	const SL = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2), SC = 1 + 0.045 * Cbp, SH = 1 + 0.015 * Cbp * T;
	const RT = -2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hbp - 275) / 25) ** 2)) * rad);
	return Math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH));
};

let failures = 0;
const check = (ok, line) => {
	if (!ok) failures++;
	console.log(`${ok ? "pass" : "FAIL"}  ${line}`);
};

for (const [name, v] of Object.entries(themes)) {
	console.log(`\n${name}`);
	const bg = v["--psp--background-color"];
	const text = [
		["--psp--color", bg],
		["--psp-charts--axis-ticks--color", bg],
		["--psp-charts--legend--color", v["--psp-charts--legend--background"]],
		["--psp-charts--tooltip--color", v["--psp-charts--tooltip--background"]],
		["--psp-inactive--color", bg],
		["--psp-active--color", bg],
		["--psp-active--color", v["--psp-active--background"]],
		["--psp-error--color", bg],
		["--psp-datagrid--pos-cell--color", bg],
		["--psp-datagrid--neg-cell--color", bg],
		["--psp-warning--color", v["--psp-warning--background"]],
	];
	for (const [fg, on] of text) {
		const r = ratio(v[fg], on);
		check(r >= 4.5, `text  ${fg.padEnd(34)} ${r.toFixed(2)}:1`);
	}
	const marks = ["--psp-charts--axis-lines--color", ...[1, 2, 3, 4, 5].map((i) => `--psp-charts--series-${i}--color`)];
	for (const m of marks) {
		const r = ratio(v[m], bg);
		check(r >= 3, `mark  ${m.padEnd(34)} ${r.toFixed(2)}:1`);
	}
	const domains = [1, 2, 3].map((i) => v[`--psp-charts--series-${i}--color`]);
	for (const [sim, m] of Object.entries(CVD)) {
		const labs = domains.map((d) => toLab(d, m));
		const min = Math.min(deltaE(labs[0], labs[1]), deltaE(labs[0], labs[2]), deltaE(labs[1], labs[2]));
		check(min >= 20, `cvd   domain series apart, ${sim.padEnd(6)}  min ΔE2000 ${min.toFixed(1)}`);
	}
}

console.log(`\n${failures ? `${failures} failure(s)` : "all checks pass"}`);
process.exitCode = failures ? 1 : 0;
