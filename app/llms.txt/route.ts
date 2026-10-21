import { metaData } from "app/config";
import { getBlogPosts } from "app/lib/posts";
import { absoluteUrl, postDescription } from "app/lib/seo";
import { projects } from "app/projects/project-data";

export const dynamic = "force-static";

// A plain-text map of the site for language models (llmstxt.org): who writes it and what each post covers.
export function GET() {
	let posts = getBlogPosts()
		.map((post) => `- [${post.metadata.title}](${absoluteUrl(`/blog/${post.slug}`)}): ${post.metadata.publishedAt.slice(0, 10)}. ${postDescription(post)}`)
		.join("\n");
	let built = projects
		.map((project) => `- [${project.title}](${absoluteUrl(project.url)}): ${project.year}. ${project.description}`)
		.join("\n");

	let body = `# ${metaData.siteName}

> ${metaData.description}

I'm Edwin. I do data and ML work at McDonald's and run a homelab at home. Every post is first-hand: the hardware, costs and failures are mine.

## Posts

${posts}

## Projects

${built}

## Elsewhere

- [RSS feed](${absoluteUrl("/rss.xml")})
- [GitHub](https://github.com/notedwin)
`;

	return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
