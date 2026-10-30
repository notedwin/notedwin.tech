import type { Metadata } from "next";
import { PageHead, SectionHead } from "./components/ne";
import { PostCard } from "./components/post-card";
import { getBlogPosts } from "./lib/posts";

export const metadata: Metadata = {
	title: "Page not found",
	description: "This page doesn't exist, or it moved.",
};

// A dead link should still lead somewhere: the three newest posts, under the header's nav.
export default function NotFound() {
	let recent = getBlogPosts().slice(0, 3);

	return (
		<main id="main" className="not-found">
			<PageHead title="Page not found" note="status:404">
				<p className="ne-pagehead__lede">This page doesn’t exist, or it moved.</p>
			</PageHead>
			{recent.length > 0 && (
				<section className="home-section" aria-labelledby="recent">
					<SectionHead id="recent" title="newest posts" />
					<ul className="post-grid">
						{recent.map((post) => (
							<li key={post.slug}>
								<PostCard post={post} />
							</li>
						))}
					</ul>
				</section>
			)}
		</main>
	);
}
