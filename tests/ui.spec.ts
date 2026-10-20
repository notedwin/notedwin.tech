import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The audit layer from the field guide: axe in both themes, no horizontal scroll and no
// console errors at 375 / 768 / 1440px. Screenshots land in test-results/ for review.
const routes = ["/", "/blog", "/blog/thunderbolt", "/blog/haxml", "/projects", "/photos", "/not-a-page"];
const widths = [375, 768, 1440];

for (const colorScheme of ["dark", "light"] as const) {
	test.describe(colorScheme, () => {
		test.use({ colorScheme, reducedMotion: "reduce" });

		for (const route of routes) {
			test(`axe ${route}`, async ({ page }) => {
				await page.goto(route);
				await page.evaluate(() => document.fonts.ready);
				let { violations } = await new AxeBuilder({ page })
					.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
					.exclude("iframe")
					.analyze();
				expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
			});

			for (const width of widths) {
				test(`layout ${route} @${width}`, async ({ page }, info) => {
					let errors: string[] = [];
					page.on("console", (m) => {
						// The 404 page reports its own status; external embeds may fail offline, and the
						// YouTube embed sometimes probes the Compute Pressure API, which Chrome logs.
						if (m.type() === "error" && !/status of 404|ERR_CONNECTION|_vercel|compute-pressure/.test(m.text())) errors.push(m.text());
					});
					await page.setViewportSize({ width, height: 900 });
					await page.goto(route);
					await page.evaluate(() => document.fonts.ready);
					expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
					await page.screenshot({ path: info.outputPath(`${width}.png`), fullPage: true });
					expect(errors).toEqual([]);
				});
			}
		}
	});
}

test("theme toggle switches, persists and applies before paint", async ({ page }) => {
	await page.goto("/");
	let before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
	await page.click(".ne-theme");
	let after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
	expect(after).not.toBe(before);
	await page.goto("/blog", { waitUntil: "commit" });
	expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBeTruthy();
});
