import fs from "fs";
import path from "path";

export type Domain = "infra" | "data" | "play";
export type Status = "seed" | "growing" | "settled" | "live";

type Metadata = {
	title: string;
	publishedAt: string;
	summary: string;
	tags: string;
	domain: Domain;
	status: Status;
	updated?: string;
	image?: string;
	// The home grid's card image, when the post's first image doesn't print well.
	cover?: string;
	// The one start-here entry, marked ★ on the blog.
	start?: boolean;
	// Lead figures under the post's head: "166,272 = failed ssh logins; 0 = guesses at root".
	figures?: string;
};

export type Post = { metadata: Metadata; slug: string; content: string };

// Returns null for files without frontmatter: those are drafts and stay unpublished.
function parseFrontmatter(fileContent: string) {
	let match = /^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/.exec(fileContent);
	if (!match) {
		return null;
	}
	let raw: Record<string, string> = {};
	let key: string | null = null;
	for (let line of match[1].split("\n")) {
		let field = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
		if (field) {
			key = field[1];
			raw[key] = field[2];
		} else if (key && /^\s+\S/.test(line)) {
			// Indented continuation of a multi-line value.
			raw[key] = `${raw[key]} ${line.trim()}`.trim();
		}
	}
	let metadata = Object.fromEntries(
		Object.entries(raw).map(([k, v]) => [k, v.trim().replace(/^['"]/, "").replace(/['"]$/, "")])
	) as Record<string, string>;
	let content = fileContent.slice(match[0].length).trim();

	return {
		metadata: {
			...metadata,
			domain: (metadata.domain || "infra") as Domain,
			status: (metadata.status || "settled") as Status,
			start: metadata.start === "true",
		} as Metadata,
		content,
	};
}

function getMDXData(dir: string): Post[] {
	return fs
		.readdirSync(dir)
		.filter((file) => path.extname(file) === ".mdx")
		.flatMap((file) => {
			let parsed = parseFrontmatter(fs.readFileSync(path.join(dir, file), "utf-8"));
			return parsed ? [{ ...parsed, slug: path.basename(file, ".mdx") }] : [];
		});
}

// Newest first.
export function getBlogPosts(): Post[] {
	return getMDXData(path.join(process.cwd(), "content")).sort((a, b) =>
		b.metadata.publishedAt.localeCompare(a.metadata.publishedAt)
	);
}

// Up to 3 topic tags; "featured" is a flag, not a topic.
export function getTags(post: Post) {
	return (post.metadata.tags || "")
		.split(",")
		.map((t) => t.trim())
		.filter((t) => t && t.toLowerCase() !== "featured")
		.slice(0, 3);
}

// The image for a post's card: its `cover`, else the first image the post shows.
export function getCardImage(post: Post) {
	return post.metadata.cover || /<Image[\s\S]*?src="([^"]+)"/.exec(post.content)?.[1];
}

// Up to three lead figures from `figures`. A value's number prints large; a unit after a space prints small.
export function getFigures(post: Post) {
	return (post.metadata.figures || "")
		.split(";")
		.map((pair) => pair.split("="))
		.filter((parts) => parts.length === 2 && parts[0].trim() && parts[1].trim())
		.slice(0, 3)
		.map(([value, label]) => {
			let [, number, unit] = /^(\S+)\s*(.*)$/.exec(value.trim())!;
			return { number, unit, label: label.trim() };
		});
}

// Prose only: code, JSX tags, comments and image syntax don't count toward reading time.
function proseText(content: string) {
	return content
		.replace(/^```[\s\S]*?^```/gm, "")
		.replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
		.replace(/<[^>]*>/g, "")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
}

// Minutes at 230 words a minute, never less than one.
export function readingMinutes(post: Post) {
	let words = proseText(post.content).split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 230));
}

export function slugify(str: string) {
	return str
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/&/g, "-and-")
		.replace(/[^\w\-]+/g, "")
		.replace(/\-\-+/g, "-");
}

// The post's h2s (MDX `#` and `##`, both render as h2) with the ids the MDX headings get.
export function getSections(post: Post) {
	let content = post.content.replace(/^```[\s\S]*?^```/gm, "");
	return [...content.matchAll(/^##? (.+)$/gm)].map(([, heading]) => {
		let text = heading
			.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
			.replace(/[`*_]/g, "")
			.trim();
		return { id: slugify(text), text };
	});
}

// ISO dates everywhere (design system: dates are ISO).
export function isoDate(date: string) {
	return date.slice(0, 10);
}

// The distance between two stops on the trail, when it's large enough to be part of the story.
export function distance(newer: string, older: string) {
	let days = (Date.parse(newer) - Date.parse(older)) / 86_400_000;
	if (days < 180) {
		return null;
	}
	if (days < 365) {
		return `+${Math.round(days / 30)} months`;
	}
	let years = Math.round(days / 365);
	return `+${years} year${years > 1 ? "s" : ""}`;
}

// Posts that continue one another, oldest first. A post in a series is read next by its sibling.
const series = [
	["homelab-2024", "homelab-2025", "homelab-2026"],
	["attack-map", "aws"],
	["health-data", "caddy-tailscale"],
];

// Up to two posts to read after this one: the next in its series (else the one before), then the
// start-here post, then the newest in the same domain, then the newest overall.
export function readNext(post: Post, posts: Post[] = getBlogPosts()): Post[] {
	let others = posts.filter((p) => p.slug !== post.slug);
	let bySlug = (slug?: string) => others.find((p) => p.slug === slug);
	let run = series.find((s) => s.includes(post.slug)) ?? [];
	let i = run.indexOf(post.slug);
	let candidates = [
		bySlug(run[i + 1]),
		bySlug(run[i - 1]),
		others.find((p) => p.metadata.start),
		others.find((p) => p.metadata.domain === post.metadata.domain),
		others[0],
		others[1],
	];
	return [...new Set(candidates.filter((p): p is Post => p !== undefined))].slice(0, 2);
}
