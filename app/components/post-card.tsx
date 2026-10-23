import Link from "next/link";
import { getCardImage, isoDate, type Post } from "app/lib/posts";
import { DitherPhoto } from "./dither";

// Three columns inside the 782px column from 768px up, two below (gutters and gaps taken off).
const sizes = "(max-width: 767px) calc((100vw - 50px) / 2), 245px";
// The two-up grid (home, read next). Phones: two cards per row. From 768px: the plate is 2/5 of a
// 379px card, beside the text.
export const pairSizes = "(max-width: 767px) calc((100vw - 50px) / 2), 145px";

// A post as a card: a small dithered header plate (its image, or a plain plate in its domain's
// wash), date, title.
// `heading` is the title's level: h2 directly under a page h1, h3 inside a section.
export function PostCard({
	post,
	heading: Title = "h3",
	sizes: plateSizes = sizes,
}: {
	post: Post;
	heading?: "h2" | "h3";
	sizes?: string;
}) {
	let image = getCardImage(post);
	return (
		<Link className="post-card" href={`/blog/${post.slug}`}>
			{image ? (
				<DitherPhoto src={image} alt="" sizes={plateSizes} className="post-card__plate" />
			) : (
				<div className="ne-plate ne-plate--plain post-card__plate" data-domain={post.metadata.domain} aria-hidden="true" />
			)}
			<p className="t-meta post-card__meta">
				<time dateTime={post.metadata.publishedAt}>{isoDate(post.metadata.publishedAt)}</time>
			</p>
			<Title className="post-card__title">
				{post.metadata.start && (
					<span className="star" aria-label="start here">
						★{" "}
					</span>
				)}
				{post.metadata.title}
			</Title>
		</Link>
	);
}
