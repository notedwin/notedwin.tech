import Link from "next/link";
import type { Metadata } from "next";
import { DomainMark, PageHead, Status } from "app/components/ne";
import { getBlogPosts, isoDate } from "app/lib/posts";

export const metadata: Metadata = {
	title: "Log",
	description: "Everything I've written, newest first: homelab, networking, data and a few detours.",
};

// One row per post, newest first, in the same shape as the projects list.
export default function BlogPosts() {
	let posts = getBlogPosts();
	let first = posts.at(-1)!.metadata.publishedAt.slice(0, 4);
	let last = posts[0].metadata.publishedAt.slice(0, 4);

	return (
		<main id="main">
			<PageHead title="Log" note={`${posts.length} entries · ${first} → ${last}`} />
			<ul className="ne-rows project-list">
				{posts.map((post) => (
					<li key={post.slug}>
						<Link href={`/blog/${post.slug}`}>
							<p className="t-meta row-meta">
								<time dateTime={post.metadata.publishedAt}>{isoDate(post.metadata.publishedAt)}</time> ·{" "}
								<DomainMark domain={post.metadata.domain} /> · <Status state={post.metadata.status} />
							</p>
							<h2 className="t-h3 row-title">
								{post.metadata.start && (
									<span className="star" aria-label="start here">
										★{" "}
									</span>
								)}
								{post.metadata.title}
								<span className="row-arrow" aria-hidden="true">
									→
								</span>
							</h2>
							{post.metadata.summary && <p className="t-body-sm muted">{post.metadata.summary}</p>}
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
