// Browser checks for a consumer's rendered pages. Warn only: prints findings, always exits 0.
// Needs @playwright/test in the consumer and a running server:
//
//   node design/checks/pages.mjs http://localhost:3100 [--baseline]
//
// Reads "pages" (routes), "emberBudget" (default 3) and "allowPages" ([{ check, theme, route,
// reason }]) from design-overrides.json, and checks every page in both themes. Allowed findings
// stay quiet; entries that no longer match are reported stale. --baseline writes the current ones.
// Checks:
//   ember    more ember-coloured elements in any one viewport down the page than the budget (1280×800)
//   measure  prose lines averaging outside 60–75 characters at 768 and 1440px
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= "0";
const cwd = process.cwd();
const base = process.argv[2];
if (!base) {
	console.error("usage: node design/checks/pages.mjs <base url>");
	process.exit(2);
}
const configPath = path.join(cwd, "design-overrides.json");
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
const pages = config.pages ?? ["/"];
const budget = config.emberBudget ?? 3;
const { chromium } = createRequire(path.join(cwd, "package.json"))("@playwright/test");

const browser = await chromium.launch();
const allowPages = config.allowPages ?? [];
const found = [];
const warn = (line) => {
	const [check, theme, route] = line.split(/\s+/);
	found.push({ check, theme, route, line });
};

for (const theme of ["dark", "light"]) {
	const context = await browser.newContext();
	await context.addInitScript((t) => localStorage.setItem("nw-theme", t), theme);
	const page = await context.newPage();
	for (const route of pages) {
		await page.setViewportSize({ width: 1280, height: 800 });
		try {
			await page.goto(base + route, { waitUntil: "load" });
			await page.waitForTimeout(500);
		} catch (e) {
			warn(`load     ${theme} ${route}  ${e.message.split("\n")[0]}`);
			continue;
		}
		const ember = await page.evaluate(() => {
			const probe = document.createElement("i");
			document.body.append(probe);
			const rgb = (v) => ((probe.style.color = v), getComputedStyle(probe).color);
			const css = getComputedStyle(document.documentElement);
			const inks = new Set(["--ember", "--ember-ink", "--ember-strong", "--flame-shadow"].map((n) => rgb(css.getPropertyValue(n).trim())));
			probe.remove();
			const hits = [];
			for (const el of document.querySelectorAll("body *")) {
				const r = el.getBoundingClientRect();
				if (!r.width || !r.height || el.closest("[aria-hidden='true']")) continue;
				const s = getComputedStyle(el);
				if (s.visibility === "hidden" || s.opacity === "0") continue;
				const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
				const before = getComputedStyle(el, "::before");
				if ((own && inks.has(s.color)) || inks.has(s.backgroundColor) || (before.content !== "none" && inks.has(before.backgroundColor))) {
					hits.push({ at: Math.floor((r.top + scrollY) / innerHeight), name: el.className ? `.${String(el.className).split(" ")[0]}` : el.tagName.toLowerCase() });
				}
			}
			// The viewport-tall slice of the page with the most ember.
			const slices = {};
			for (const h of hits) (slices[h.at] ??= []).push(h.name);
			return Object.entries(slices).sort((a, b) => b[1].length - a[1].length)[0] ?? [0, []];
		});
		const [slice, names] = ember;
		if (names.length > budget) warn(`ember    ${theme} ${route}  ${names.length} in viewport ${Number(slice) + 1} (budget ${budget}): ${[...new Set(names)].join(" ")}`);

		for (const width of [768, 1440]) {
			await page.setViewportSize({ width, height: 900 });
			const perLine = await page.evaluate(() => {
				const out = [];
				for (const p of document.querySelectorAll(".ne-prose > p")) {
					const lines = Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight));
					if (lines >= 3) out.push(p.textContent.trim().length / (lines - 0.5));
				}
				return out.length ? Math.round(out.reduce((a, b) => a + b) / out.length) : null;
			});
			if (perLine && (perLine < 60 || perLine > 75)) warn(`measure  ${theme} ${route} @${width}  ${perLine} characters a line (aim 60–75)`);
		}
	}
	await context.close();
}
await browser.close();

const key = (f) => `${f.check}|${f.theme}|${f.route}`;
if (process.argv.includes("--baseline")) {
	const date = new Date().toISOString().slice(0, 10);
	config.allowPages = found.map((f) => ({ check: f.check, theme: f.theme, route: f.route, reason: allowPages.find((a) => key(a) === key(f))?.reason ?? `baseline ${date}` }));
	fs.writeFileSync(configPath, JSON.stringify(config, null, "\t") + "\n");
	console.log(`pages: wrote ${found.length} allowed findings to design-overrides.json`);
	process.exit(0);
}
const allowed = new Set(allowPages.map(key));
const live = new Set(found.map(key));
const fresh = found.filter((f) => !allowed.has(key(f)));
for (const f of fresh) console.log(`WARN   ${f.line}`);
for (const a of allowPages.filter((a) => !live.has(key(a)))) console.log(`stale  ${a.check.padEnd(8)} ${a.theme} ${a.route}  (fixed: remove it from design-overrides.json)`);
console.log(`pages: ${fresh.length} new, ${allowed.size} allowed, ${allowPages.filter((a) => !live.has(key(a))).length} stale, across ${pages.length} pages in both themes`);
