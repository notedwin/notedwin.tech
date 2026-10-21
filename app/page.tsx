import Link from "next/link";
import { Cube } from "./components/cube";
import { CommitLine } from "./components/commit-line";
import { SectionHead } from "./components/ne";
import { PostCard } from "./components/post-card";
import { getBlogPosts, type Post } from "./lib/posts";

// Phones: two stacked cards per row. From 768px: the plate is 2/5 of a 379px card, beside the text.
const homeCardSizes = "(max-width: 767px) calc((100vw - 50px) / 2), 145px";

// The posts the home grid shows, in this order.
const homeSlugs = ["homelab-2026", "homelab-2025", "attack-map", "haxml"];

export default function Page() {
	let posts = getBlogPosts();
	let picked = homeSlugs
		.map((slug) => posts.find((post) => post.slug === slug))
		.filter((post): post is Post => post !== undefined);

	return (
		<main id="main" className="home">
			<section className="intro" aria-label="intro">
				<div>
					<h1 className="intro__lede">
						Hey, I’m Edwin, currently doing data and ML things at{" "}
						<a className="ne-link" href="https://mcdonalds.com" rel="noopener noreferrer">
							McD
						</a>{" "}
						🍟
					</h1>
					<p className="intro__lede intro__lede--muted">
						In my free time, I’m either cycling or building pet projects on my{" "}
						<Link className="ne-link" href="/blog/homelab-2026">
							personal cloud
						</Link>
						.
					</p>
					<CommitLine className="intro__commit" />
				</div>
				<Cube />
			</section>

			<section className="home-section" aria-labelledby="blog">
				<SectionHead
					id="blog"
					title="blog"
					note={
						<Link className="sh-link" href="/blog">
							all posts →
						</Link>
					}
				/>
				<ul className="post-grid post-grid--home">
					{picked.map((post) => (
						<li key={post.slug}>
							<PostCard post={post} sizes={homeCardSizes} />
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
