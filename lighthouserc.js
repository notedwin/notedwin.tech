// Budgets from the front-end field guide. Run against a production build or a Vercel
// preview URL: `pnpm build && pnpm dlx @lhci/cli@0.15.1 autorun`.
module.exports = {
	ci: {
		collect: {
			startServerCommand: "pnpm start --port 3200",
			url: ["http://localhost:3200/", "http://localhost:3200/blog", "http://localhost:3200/blog/thunderbolt", "http://localhost:3200/photos"],
			numberOfRuns: 3,
		},
		assert: {
			assertions: {
				"categories:performance": ["error", { minScore: 0.9 }],
				"categories:accessibility": ["error", { minScore: 1 }],
				"categories:best-practices": ["error", { minScore: 0.95 }],
				"categories:seo": ["error", { minScore: 0.95 }],
				"largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
				"cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
				"total-blocking-time": ["error", { maxNumericValue: 200 }],
			},
		},
		upload: { target: "temporary-public-storage" },
	},
};
