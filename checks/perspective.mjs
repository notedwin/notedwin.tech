// Renders checks/perspective.html in Chromium in both themes and checks that Perspective 5.5
// picks up the notedwin themes: the viewer reports the theme by name, its computed colors
// match css/perspective.css, and the page logs no errors. Screenshots land in checks/out/.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(import.meta.dirname, "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".wasm": "application/wasm", ".woff2": "font/woff2", ".json": "application/json", ".map": "application/json" };
const server = http.createServer((req, res) => {
	const file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
	if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
		res.writeHead(404).end();
		return;
	}
	res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
	fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const css = fs.readFileSync(path.join(root, "css/perspective.css"), "utf8");
const expected = (name, prop) => new RegExp(`\\[theme="${name}"\\][^{]*\\{[^}]*${prop}:\\s*([^;]+);`).exec(css)?.[1].trim();

fs.mkdirSync(path.join(root, "checks/out"), { recursive: true });
const browser = await chromium.launch();
let failures = 0;
for (const [mode, name] of [["dark", "notedwin graphite"], ["light", "notedwin smoke"]]) {
	const page = await browser.newPage({ viewport: { width: 1280, height: 560 }, deviceScaleFactor: 2 });
	const errors = [];
	page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
	page.on("pageerror", (e) => errors.push(String(e)));
	await page.goto(`${base}/checks/perspective.html?theme=${mode}`);
	await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
	await page.waitForTimeout(1500);
	const got = await page.evaluate(async () => {
		const v = document.getElementById("chart");
		const cs = getComputedStyle(v);
		return {
			theme: (await v.save()).theme,
			background: cs.getPropertyValue("--psp--background-color").trim(),
			series1: cs.getPropertyValue("--psp-charts--series-1--color").trim(),
			series2: cs.getPropertyValue("--psp-charts--series-2--color").trim(),
			available: await v.getAllThemes?.(),
		};
	});
	const out = path.join(root, `checks/out/perspective-${mode}.png`);
	await page.screenshot({ path: out });
	const checks = [
		[got.theme === name, `viewer theme is "${got.theme}"`],
		[got.background === expected(name, "--psp--background-color"), `background ${got.background}`],
		[got.series1 === expected(name, "--psp-charts--series-1--color"), `series 1 (infra) ${got.series1}`],
		[got.series2 === expected(name, "--psp-charts--series-2--color"), `series 2 (data) ${got.series2}`],
		[errors.length === 0, `console errors: ${errors.length ? errors.join(" | ").slice(0, 300) : "none"}`],
	];
	console.log(`\n${name}  (themes registered: ${got.available?.join(", ") ?? "n/a"})`);
	for (const [ok, line] of checks) {
		if (!ok) failures++;
		console.log(`${ok ? "pass" : "FAIL"}  ${line}`);
	}
	console.log(`      screenshot ${path.relative(process.cwd(), out)}`);
	await page.close();
}
await browser.close();
server.close();
console.log(`\n${failures ? `${failures} failure(s)` : "perspective renders with both notedwin themes"}`);
process.exitCode = failures ? 1 : 0;
