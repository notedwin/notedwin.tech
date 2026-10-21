import { MetadataRoute } from "next";
import { getBlogPosts } from "./lib/posts";
import { absoluteUrl } from "./lib/seo";

// Real dates only: a lastmod that changes on every build teaches search engines to ignore it.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	let posts = getBlogPosts();
	let blogs = posts.map((post) => ({
		url: absoluteUrl(`/blog/${post.slug}`),
		lastModified: post.metadata.updated || post.metadata.publishedAt,
	}));
	let newest = blogs.map((post) => post.lastModified).sort().at(-1);

	return [
		{ url: absoluteUrl("/"), lastModified: newest },
		{ url: absoluteUrl("/blog"), lastModified: newest },
		{ url: absoluteUrl("/projects") },
		{ url: absoluteUrl("/photos") },
		...blogs,
	];
}
