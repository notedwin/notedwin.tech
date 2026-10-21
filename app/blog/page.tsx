import type { Metadata } from "next";
import { pageMetadata } from "app/lib/seo";
import { PageHead } from "app/components/ne";
import { PostCard } from "app/components/post-card";
import { getBlogPosts } from "app/lib/posts";

export const metadata: Metadata = pageMetadata({
	title: "Blog",
	description: "Everything I've written, newest first: homelab, networking, data and a few detours.",
	path: "/blog",
});

// Every post as a card, newest first, in the same grid as the home page.
export default function BlogPosts() {
	let posts = getBlogPosts();
	let first = posts.at(-1)!.metadata.publishedAt.slice(0, 4);
	let last = posts[0].metadata.publishedAt.slice(0, 4);

	return (
		<main id="main">
			<PageHead title="Blog" note={`${posts.length} posts · ${first} → ${last}`} />
			<ul className="post-grid">
				{posts.map((post) => (
					<li key={post.slug}>
						<PostCard post={post} heading="h2" />
					</li>
				))}
			</ul>
		</main>
	);
}
