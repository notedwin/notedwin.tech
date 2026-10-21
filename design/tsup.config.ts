import { defineConfig } from "tsup";

// Three entries: react (server-safe parts), client (marked "use client"), theme (no React).
export default defineConfig([
	{ entry: { react: "src/react.ts", theme: "src/theme.ts" }, format: "esm", dts: true, clean: true, external: ["react"] },
	{ entry: { client: "src/client.ts" }, format: "esm", dts: true, external: ["react"], banner: { js: '"use client";' } },
]);
