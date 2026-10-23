import { getBlogPosts, getTags, type Post } from "./posts";
import type { SearchDoc } from "./search";

// MDX to the plain text search indexes: link and image text stay, code stays (people search for
// commands), markup, JSX and URLs go. Line breaks stay, so a snippet never runs a heading into the
// paragraph under it.
function plainText(mdx: string) {
	return mdx
		.replace(/^(import|export) .*$/gm, " ")
		.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/https?:\/\/\S+/g, " ")
		.replace(/```[a-z]*/g, " ")
		.replace(/[#*_>`|~-]+/g, " ")
		.replace(/[ \t]+/g, " ")
		.replace(/\s*\n\s*/g, "\n")
		.trim();
}

export function searchDoc(post: Post): SearchDoc {
	return {
		slug: post.slug,
		title: post.metadata.title,
		tags: getTags(post).join(" "),
		summary: post.metadata.summary,
		body: plainText(post.content),
	};
}

export const getSearchDocs = () => getBlogPosts().map(searchDoc);
