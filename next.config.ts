import type { NextConfig } from "next";

const old_urls = [
	"/adding_logs",
	"/attack_map",
	"/homelab-2024",
	"/caddy-tailscale",
	"/haxml",
	"/health-data",
	"/local_setup",
];

// Old paths whose post slug differs from the path.
const renamed: Record<string, string> = {
	"/attack_map": "/blog/attack-map",
	"/homelab-2024": "/blog/homelab-2023",
};

const redirects = old_urls.map((url) => ({
	source: url,
	destination: renamed[url] ?? `/blog${url}`,
}));

const nextConfig: NextConfig = {
	reactStrictMode: true,
	async rewrites() {
		const rss = [
			{
				source: "/rss.xml",
				destination: "/feed/rss.xml",
			},
			{
				source: "/atom.xml",
				destination: "/feed/atom.xml",
			},
			{
				source: "/feed.json",
				destination: "/feed/feed.json",
			},
			{
				source: "/rss",
				destination: "/feed/rss.xml",
			},
			{
				source: "/feed",
				destination: "/feed/rss.xml",
			},
			{
				source: "/atom",
				destination: "/feed/atom.xml",
			},
			{
				source: "/json",
				destination: "/feed/feed.json",
			},
			{
				source: "/about",
				destination: "/blog/lore",
			},
		];
		// concat the rss array with the new urls array
		return [...rss, ...redirects];
	},
};

export default nextConfig;
