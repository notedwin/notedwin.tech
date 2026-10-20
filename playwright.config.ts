import { defineConfig } from "@playwright/test";

// Runs against a production build (`pnpm build` first). Browsers live in node_modules
// (PLAYWRIGHT_BROWSERS_PATH=0, as for playwright-cli).
export default defineConfig({
	testDir: "tests",
	fullyParallel: true,
	reporter: "list",
	use: { baseURL: "http://localhost:3100" },
	webServer: {
		command: "pnpm start --port 3100",
		url: "http://localhost:3100",
		reuseExistingServer: false,
	},
});
