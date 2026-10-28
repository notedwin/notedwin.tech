import type { Metadata } from "next";
import { metaData, socialLinks } from "app/config";
import type { Post } from "./posts";

export function absoluteUrl(path: string) {
	return new URL(path, metaData.baseUrl).toString();
}

// A page that sets `alternates` replaces the layout's, so every page repeats the feed links.
export const feedTypes = {
	"application/rss+xml": "/rss.xml",
	"application/atom+xml": "/atom.xml",
	"application/feed+json": "/feed.json",
};

// Edwin's X handle, as both the site and the author of every card.
export const twitterHandle = "@mu0xide";

// One page's title, description, canonical URL and share card. Next merges `openGraph` shallowly,
// so a page that sets none inherits the home page's url and title; this sets all of them.
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
	return {
		title,
		description,
		alternates: { canonical: path, types: feedTypes },
		openGraph: {
			title,
			description,
			url: path,
			siteName: metaData.siteName,
			locale: "en_US",
			type: "website",
			images: ogImages(title),
		},
		twitter: {
			card: "summary_large_image",
			site: twitterHandle,
			creator: twitterHandle,
			title,
			description,
			images: twitterImage(title),
		},
	};
}

// The person behind the site, linked to the same person elsewhere so search and AI tools can
// attribute posts to one author.
export const person = {
	"@type": "Person",
	"@id": absoluteUrl("/#person"),
	name: metaData.name,
	alternateName: "notedwin",
	url: metaData.baseUrl,
	image: absoluteUrl("/profile.png"),
	sameAs: Object.values(socialLinks),
};

// JSON-LD for a <script> tag; `<` is escaped so a title can't close the tag.
export function jsonLd(data: Record<string, unknown>) {
	return JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");
}

// Share card sizes, drawn by app/og. Large is the 1.91:1 card LinkedIn, Facebook and X show; medium
// is the same card at half size; small is a square for apps that crop to a thumbnail (Slack, iMessage).
export const ogSizes = {
	large: { width: 1200, height: 630 },
	medium: { width: 600, height: 315 },
	small: { width: 400, height: 400 },
} as const;
export type OgSize = keyof typeof ogSizes;

export function ogImageUrl(title: string, size: OgSize = "large") {
	let query = size === "large" ? "" : `&size=${size}`;
	return absoluteUrl(`/og?title=${encodeURIComponent(title)}${query}`);
}

// Every size of a title's share card, largest first (most crawlers take the first), with width and
// height so LinkedIn can render the card on first share without fetching the image to measure it.
export function ogImages(title: string) {
	return (Object.keys(ogSizes) as OgSize[]).map((size) => ({
		url: ogImageUrl(title, size),
		...ogSizes[size],
		alt: title,
		type: "image/png",
	}));
}

// X shows one image: the large card.
export function twitterImage(title: string) {
	return { url: ogImageUrl(title), alt: title };
}

// The post's summary, or its first paragraph of prose when the summary is empty.
export function postDescription(post: Post) {
	if (post.metadata.summary) {
		return post.metadata.summary;
	}
	let paragraph = post.content
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.find((block) => /^[A-Za-z*_"“‘']/.test(block) && !block.startsWith("import "));
	let text = (paragraph ?? "")
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/[*_`]/g, "")
		.replace(/\s+/g, " ")
		.trim();
	return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, "")}…` : text;
}
