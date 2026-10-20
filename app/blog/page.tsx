import Link from "next/link";
import type { Metadata } from "next";
import { PageHead, Tag } from "app/components/ne";
import { distance, getBlogPosts, getTags, isoDate } from "app/lib/posts";

export const metadata: Metadata = {
	title: "Log",
	description: "Everything I've written, newest first: homelab, networking, data and a few detours.",
};

// Trail mode: dates on a route, one stop per post, the distance shown when the gap is long.
export default function BlogPosts() {
	let posts = getBlogPosts();
	let first = posts.at(-1)!.metadata.publishedAt.slice(0, 4);
	let last = posts[0].metadata.publishedAt.slice(0, 4);

	return (
		<main id="main" data-mode="trail">
			<PageHead title="Log" note={`${posts.length} entries · ${first} → ${last}`} />
			<ol className="ne-trail trail">
				{posts.map((post, i) => {
					let gap = i > 0 ? distance(posts[i - 1].metadata.publishedAt, post.metadata.publishedAt) : null;
					return (
						<li key={post.slug} className="trail__item">
							{gap && (
								<>
									<span aria-hidden="true" />
									<span className="ne-trail__gap">{gap}</span>
								</>
							)}
							<time className="ne-trail__date" dateTime={post.metadata.publishedAt}>
								{isoDate(post.metadata.publishedAt)}
							</time>
							<div className="ne-trail__stop" data-domain={post.metadata.domain}>
								<h2 className="ne-trail__title">
									<Link href={`/blog/${post.slug}`}>
										{post.metadata.start && (
											<span className="star" aria-label="start here">
												★{" "}
											</span>
										)}
										{post.metadata.title}
									</Link>
								</h2>
								{post.metadata.summary && <p className="ne-trail__body">{post.metadata.summary}</p>}
								<p className="trail__tags">
									{getTags(post).map((t) => (
										<Tag key={t} domain={post.metadata.domain}>
											{t}
										</Tag>
									))}
								</p>
							</div>
						</li>
					);
				})}
			</ol>
		</main>
	);
}
