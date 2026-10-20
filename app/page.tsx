import Link from "next/link";
import { Cube } from "./components/cube";
import { DitherPhoto } from "./components/dither";
import { CommitLine } from "./components/commit-line";
import { DomainMark, SectionHead } from "./components/ne";
import { getBlogPosts, getCardImage, isoDate } from "./lib/posts";

// Three columns inside the 782px column from 768px up, two below (gutters and gaps taken off).
const cardSizes = "(max-width: 767px) calc((100vw - 50px) / 2), 245px";

export default function Page() {
	// The six newest posts that have an image, for the grid's dithered header plates.
	let recent = getBlogPosts()
		.map((post) => ({ post, image: getCardImage(post) }))
		.filter((p): p is { post: (typeof p)["post"]; image: string } => Boolean(p.image))
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
					{recent.map(({ post, image }) => (
						<li key={post.slug}>
							<Link className="post-card" href={`/blog/${post.slug}`}>
								<DitherPhoto src={image} alt="" sizes={cardSizes} className="post-card__plate" />
								<p className="t-label post-card__meta">
									{isoDate(post.metadata.publishedAt)} · <DomainMark domain={post.metadata.domain} />
								</p>
								<h3 className="post-card__title">
									{post.metadata.start && (
										<span className="star" aria-label="start here">
											★{" "}
										</span>
									)}
									{post.metadata.title}
								</h3>
							</Link>
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
