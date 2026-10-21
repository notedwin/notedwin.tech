import type { NextConfig } from "next";

// Every post slug the site has served. Older versions put posts at /<slug> and /posts/<slug>.
const slugs = [
	"adding_logs",
	"attack-map",
	"aws",
	"caddy-tailscale",
	"haxml",
	"health-data",
	"homelab-2024",
	"local_setup",
	"lore",
	"remove-drm",
	"string_duck",
	"website",
];

// Old slugs that were renamed or folded into another post; null means no successor, so /blog.
const renamed: Record<string, string | null> = {
	attack_map: "attack-map",
	"homelab-2023": "homelab-2024",
	homelab: "homelab-2025",
	TIL: "til1",
	"home-server": "website",
	apple: null,
	hackthebox: null,
	misc: null,
};

function post(slug: string | null) {
	return slug ? `/blog/${slug}` : "/blog";
}

// Permanent, so search engines move each old URL's ranking to the new one instead of indexing both.
const redirects = [
	...slugs.flatMap((slug) => [
		{ source: `/${slug}`, destination: post(slug) },
		{ source: `/posts/${slug}`, destination: post(slug) },
	]),
	...Object.entries(renamed).flatMap(([old, slug]) => [
		{ source: `/${old}`, destination: post(slug) },
		{ source: `/posts/${old}`, destination: post(slug) },
		{ source: `/blog/${old}`, destination: post(slug) },
	]),
	{ source: "/about", destination: "/blog/lore" },
	// The redesign moved post images and photos from PNG/JPG to WebP at the same path.
	{
		source: "/:dir(assets|photos)/:path*/:name.:ext(png|PNG|jpg|JPG|jpeg)",
		destination: "/:dir/:path*/:name.webp",
	},
].map((redirect) => ({ ...redirect, permanent: true }));

const nextConfig: NextConfig = {
	reactStrictMode: true,
	async redirects() {
		return redirects;
	},
	async rewrites() {
		return [
			{ source: "/rss.xml", destination: "/feed/rss.xml" },
			{ source: "/atom.xml", destination: "/feed/atom.xml" },
			{ source: "/feed.json", destination: "/feed/feed.json" },
			{ source: "/rss", destination: "/feed/rss.xml" },
			{ source: "/feed", destination: "/feed/rss.xml" },
			{ source: "/atom", destination: "/feed/atom.xml" },
			{ source: "/json", destination: "/feed/feed.json" },
		];
	},
};

export default nextConfig;
