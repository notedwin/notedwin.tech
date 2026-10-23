import type { Metadata } from "next";
import { pageMetadata } from "app/lib/seo";
import { PageHead } from "app/components/ne";
import { BlogSearch } from "app/components/blog-search";
import { PostCard } from "app/components/post-card";
import { getBlogPosts } from "app/lib/posts";

export const metadata: Metadata = pageMetadata({
	title: "Blog",
	description: "Everything I've written, newest first: homelab, networking, data and a few detours.",
	path: "/blog",
});

// Every post as a card, newest first, in the same grid as the home page, with search and sort above.
export default function BlogPosts() {
	let posts = getBlogPosts();

	return (
		<main id="main">
			<PageHead title="Blog" note={`${posts.length} posts`} />
			<BlogSearch entries={posts.map((post) => ({ slug: post.slug, card: <PostCard post={post} heading="h2" /> }))} />
		</main>
	);
}
