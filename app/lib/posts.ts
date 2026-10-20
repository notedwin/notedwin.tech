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
	// The one start-here entry, marked ★ in the log.
	start?: boolean;
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

// First image an MDX post shows, for its plate on the home page.
export function getFirstImage(post: Post) {
	return /<Image[\s\S]*?src="([^"]+)"/.exec(post.content)?.[1];
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
