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
			images: metaData.ogImage,
		},
		twitter: { card: "summary_large_image", title, description, images: metaData.ogImage },
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

export function ogImageUrl(title: string) {
	return absoluteUrl(`/og?title=${encodeURIComponent(title)}`);
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
