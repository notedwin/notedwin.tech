// Checks a consumer of the system (a site or app) against the rules the book states in prose.
// Warn only: it prints findings and always exits 0. Run it from the consumer's root:
//
//   node design/checks/consumer.mjs [--baseline]
//   node checks/consumer.mjs --system        (in this repo: the system's own CSS, for pnpm check)
//
// It reads design-overrides.json there: { "register": "reading" | "instrument", "css": [globs],
// "markup": [globs], "allow": [{ check, selector, detail, reason }] }. A finding that matches an
// "allow" entry is allowed; an entry that no longer matches anything is reported as stale, so the
// list only shrinks. --baseline writes every current finding into "allow" with a dated reason.
//
// Checks:
//   override  a selector that restyles a system class (.ne-*, .t-*) or redefines a system variable
//   type      a font size and line height that match no type style in tokens.json
//   pixel     Departure Mono in the reading register outside tables, figures and numerals
//   ink       ember, brand (flame-*, ash-*) or signal colours used as text where the book forbids it
//   weight    a mono weight meant to contrast with its base rule but drawn from the same font file
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const tokens = JSON.parse(fs.readFileSync(path.join(root, "src/tokens.json"), "utf8"));
const system = process.argv.includes("--system");
const cwd = process.cwd();
const configPath = path.join(cwd, "design-overrides.json");
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
const register = config.register ?? "instrument";
const allow = config.allow ?? [];

// Files: a glob of the form dir/**/*.ext or a plain path.
const expand = (glob) => {
	const m = /^(.*?)\/\*\*\/\*\.(\w+)$/.exec(glob);
	if (!m) return fs.existsSync(path.join(cwd, glob)) ? [path.join(cwd, glob)] : [];
	const out = [];
	const walk = (dir) => {
		for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
			if (e.name === "node_modules" || e.name.startsWith(".")) continue;
			const full = path.join(dir, e.name);
			if (e.isDirectory()) walk(full);
			else if (e.name.endsWith(`.${m[2]}`)) out.push(full);
		}
	};
	if (fs.existsSync(path.join(cwd, m[1]))) walk(path.join(cwd, m[1]));
	return out;
};
const cssFiles = system ? [] : (config.css ?? ["app/**/*.css"]).flatMap(expand);
const markupFiles = system ? [] : (config.markup ?? ["app/**/*.tsx", "app/**/*.jsx", "components/**/*.jsx"]).flatMap(expand);

// The system's names: every token, plus the variables bundle.css defines.
const bundle = fs.readFileSync(path.join(root, "src/bundle.css"), "utf8") + fs.readFileSync(path.join(root, "src/parts.css"), "utf8");
const systemVars = new Set([
	...["color", "spacing", "radius", "shadow", "size"].flatMap((f) => (tokens[f]?.tokens ?? []).map((t) => t.name)),
	...[...bundle.matchAll(/(--[a-z][a-z0-9-]*)\s*:/g)].map((m) => m[1].slice(2)),
	"dither-ink",
	"dither-opacity",
]);
const styles = tokens.type.groups.flatMap((g) => g.styles);
const pairs = new Set(styles.map((s) => `${parseFloat(s.fontSize)}/${parseFloat(s.lineHeight)}`));
const sizes = new Set(styles.map((s) => parseFloat(s.fontSize)));

// CSS rules, innermost blocks only, with comments blanked so line numbers hold.
const rules = (file) => {
	const css = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
	return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
		.map((m) => ({
			selector: m[1].trim().replace(/\s+/g, " "),
			line: css.slice(0, m.index + m[0].length - m[2].length).split("\n").length,
			decls: [...m[2].matchAll(/(--[\w-]+|[a-z-]+)\s*:\s*([^;]+)/g)].map(([, p, v]) => [p, v.trim()]),
		}))
		.filter((r) => !r.selector.startsWith("@"));
};

const findings = [];
const add = (check, file, line, selector, detail) => findings.push({ check, file: path.relative(cwd, file), line, selector, detail });

const monoFiles = tokens.type.fonts.filter((f) => f.family === "Commit Mono");
const monoFile = (w) => monoFiles.find((f) => { const [lo, hi = lo] = String(f.weight).split(" ").map(Number); return w >= lo && w <= hi; })?.file;
const weightOf = (decls) => {
	const font = decls.find(([p]) => p === "font")?.[1];
	const w = decls.findLast(([p]) => p === "font-weight")?.[1] ?? font?.match(/^(\d{3})\b/)?.[1];
	return w ? Number(w) : null;
};
const isMono = (decls) => decls.some(([p, v]) => (p === "font" || p === "font-family") && v.includes("--font-mono"));
const monoRules = [];

for (const [file, isSystem] of [[path.join(root, "src/bundle.css"), true], ...cssFiles.map((f) => [f, false])]) {
	for (const r of rules(file)) {
		if (isMono(r.decls) && weightOf(r.decls)) monoRules.push({ ...r, file, weight: weightOf(r.decls) });
		if (isSystem) continue;
		const { selector, line, decls } = r;

		if (/\.(ne|t)-[\w-]/.test(selector)) add("override", file, line, selector, "restyles a system class");
		for (const [p] of decls) if (p.startsWith("--") && systemVars.has(p.slice(2))) add("override", file, line, selector, `redefines ${p}`);

		const font = decls.find(([p]) => p === "font")?.[1];
		const size = decls.findLast(([p]) => p === "font-size")?.[1] ?? font?.match(/(\d+(?:\.\d+)?px)/)?.[1];
		const lh = decls.findLast(([p]) => p === "line-height")?.[1] ?? font?.match(/\/\s*(\d+(?:\.\d+)?px)/)?.[1];
		if (size?.endsWith("px")) {
			const key = `${parseFloat(size)}/${lh?.endsWith("px") ? parseFloat(lh) : "?"}`;
			if (lh?.endsWith("px") ? !pairs.has(key) : !sizes.has(parseFloat(size))) add("type", file, line, selector, `${key.replace("/?", "")}px is not a type style`);
		}

		const pixel = decls.some(([p, v]) => (p === "font" || p === "font-family") && v.includes("--font-pixel"));
		if (pixel && register === "reading" && !/\bth\b|results__|metric|tile|fig/.test(selector)) add("pixel", file, line, selector, "Departure Mono outside tables, figures and numerals");

		for (const [p, v] of decls) {
			const textual = p === "color" || p === "-webkit-text-fill-color" || p.startsWith("--shiki-token-");
			if (!textual) continue;
			if (/--shiki-token-(inserted|deleted|changed)/.test(p)) continue;
			const bad = /var\(--(ember|ember-strong|flame-[a-z]+|ash-\d+)\)/.exec(v) ?? (!/status/.test(selector) ? /var\(--(signal-[a-z]+)\)/.exec(v) : null);
			if (bad) add("ink", file, line, selector, `${p}: ${bad[1]} as text`);
			if (p.startsWith("--shiki-token-") && /var\(--ember-ink\)/.test(v)) add("ink", file, line, selector, `${p}: ember-ink spends the ember budget on code`);
		}
	}
}

// A rule that extends a mono rule's selector (`.ne-nav a[aria-current]` from `.ne-nav a`) and only
// changes the weight inherits the face: flag it when both weights come from one file. The
// system's own rules are checked with --system, so a consumer can't allow them away.
for (const file of system ? [path.join(root, "src/bundle.css")] : cssFiles) {
	for (const r of rules(file)) {
		const w = weightOf(r.decls);
		if (!w || isMono(r.decls)) continue;
		const base = monoRules.find((m) => r.selector !== m.selector && r.selector.startsWith(m.selector) && m.weight !== w);
		if (base && monoFile(w) && monoFile(w) === monoFile(base.weight)) add("weight", file, r.line, r.selector, `${w} and ${base.selector} at ${base.weight} draw the same file (${monoFile(w)})`);
	}
}

for (const file of markupFiles) {
	const src = fs.readFileSync(file, "utf8");
	for (const m of src.matchAll(/\btext-(ember|ember-strong|flame-[a-z]+|ash-\d+)(?![\w-])/g)) {
		add("ink", file, src.slice(0, m.index).split("\n").length, m[0], `${m[1]} as text`);
	}
}

const key = (f) => `${f.check}|${f.selector}|${f.detail}`;
const allowed = new Set(allow.map(key));
const live = new Set(findings.map(key));

if (process.argv.includes("--baseline")) {
	const date = new Date().toISOString().slice(0, 10);
	const seen = new Set();
	config.register = register;
	config.allow = findings.filter((f) => !seen.has(key(f)) && seen.add(key(f))).map(({ check, selector, detail }) => ({ check, selector, detail, reason: allow.find((a) => key(a) === `${check}|${selector}|${detail}`)?.reason ?? `baseline ${date}` }));
	fs.writeFileSync(configPath, JSON.stringify(config, null, "\t") + "\n");
	console.log(`consumer: wrote ${config.allow.length} allowed findings to design-overrides.json`);
	process.exit(0);
}

const fresh = findings.filter((f) => !allowed.has(key(f)));
const stale = allow.filter((a) => !live.has(key(a)));
for (const f of fresh) console.log(`WARN   ${f.check.padEnd(8)} ${f.file}:${f.line}  ${f.selector}  ${f.detail}`);
for (const a of stale) console.log(`stale  ${a.check.padEnd(8)} ${a.selector}  ${a.detail}  (fixed: remove it from design-overrides.json)`);
const tally = {};
for (const f of findings) tally[f.check] = (tally[f.check] ?? 0) + 1;
const counts = Object.entries(tally).map(([c, n]) => `${c} ${n}`).join(", ");
console.log(`${system ? "system" : `consumer (${register})`}: ${fresh.length} new, ${allowed.size} allowed, ${stale.length} stale${counts ? ` · ${counts}` : ""}`);
