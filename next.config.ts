import type { NextConfig } from "next";

const old_urls = [
	"/adding_logs",
	"/attack_map",
	"/homelab-2024",
	"/caddy-tailscale",
	"/haxml",
	"/health-data",
];

const redirects = old_urls.map((url) => ({
	source: url,
	destination: `/blog${url}`,
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
		];
		// concat the rss array with the new urls array
		return [...rss, ...redirects];
	},
};

export default nextConfig;
