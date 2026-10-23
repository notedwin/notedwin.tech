import { getBlogPosts, getTags, type Post } from "./posts";
import type { SearchDoc } from "./search";

// MDX to the plain text search indexes: link and image text stay, code stays (people search for
// commands), markup, JSX and URLs go.
function plainText(mdx: string) {
	return mdx
		.replace(/^(import|export) .*$/gm, " ")
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/https?:\/\/\S+/g, " ")
		.replace(/```[a-z]*/g, " ")
		.replace(/[#*_>`|~-]+/g, " ")
		.replace(/\s+/g, " ")
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
