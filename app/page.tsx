import Link from "next/link";
import { Cube } from "./components/cube";
import { CommitLine } from "./components/commit-line";
import { SectionHead } from "./components/ne";
import { PostCard } from "./components/post-card";
import { getBlogPosts, getCardImage } from "./lib/posts";

export default function Page() {
	// The six newest posts that have an image, for the grid's dithered header plates.
	let recent = getBlogPosts()
		.filter((post) => getCardImage(post))
		.slice(0, 6);

	return (
		<main id="main" className="home">
			<section className="intro" aria-label="intro">
				<div>
					<h1 className="intro__lede">
						My name is Edwin. I’m a data engineer at{" "}
						<a className="ne-link" href="https://mcdonalds.com" rel="noopener noreferrer">
							McDonald’s
						</a>
						, and I learn by taking things apart.
					</h1>
					<p className="intro__lede intro__lede--muted">
						Outside work I’m building out my{" "}
						<Link className="ne-link" href="/blog/homelab">
							homelab
						</Link>{" "}
						or riding my bike.
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
				<ul className="post-grid">
					{recent.map((post) => (
						<li key={post.slug}>
							<PostCard post={post} />
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
