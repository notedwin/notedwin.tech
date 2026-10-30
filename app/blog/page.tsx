import type { Metadata } from "next";
import { metaData } from "app/config";
import { absoluteUrl, jsonLd, pageMetadata, person } from "app/lib/seo";
import { PageHead } from "app/components/ne";
import { BlogSearch } from "app/components/blog-search";
import { PostCard } from "app/components/post-card";
import { getBlogPosts } from "app/lib/posts";

const description = "Everything I've written, newest first: homelab, networking, data and a few detours.";

export const metadata: Metadata = pageMetadata({ title: "Blog", description, path: "/blog" });

// Every post as a card, newest first, in the same grid as the home page, with search and sort above.
export default function BlogPosts() {
	let posts = getBlogPosts();

	return (
		<main id="main">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					// The Blog each post's markup names as its parent (`isPartOf`).
					__html: jsonLd({
						"@type": "Blog",
						"@id": absoluteUrl("/blog#blog"),
						url: absoluteUrl("/blog"),
						name: metaData.siteName,
						description,
						inLanguage: "en",
						author: { "@id": person["@id"] },
						blogPost: posts.map((post) => ({ "@id": `${absoluteUrl(`/blog/${post.slug}`)}#post` })),
					}),
				}}
			/>
			<PageHead title="Blog" />
			<BlogSearch entries={posts.map((post) => ({ slug: post.slug, card: <PostCard post={post} heading="h2" /> }))} />
		</main>
	);
}
