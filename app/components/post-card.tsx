import Link from "next/link";
import { getCardImage, isoDate, type Post } from "app/lib/posts";
import { DitherPhoto } from "./dither";
import { FieldPlate } from "./field-plate";

// Three columns inside the 782px column from 768px up, two below (gutters and gaps taken off).
const sizes = "(max-width: 767px) calc((100vw - 50px) / 2), 245px";

// A post as a card: a small dithered header plate (its image, or a data plate), date, title.
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
				<FieldPlate seed={post.slug} className="post-card__plate" />
			)}
			<p className="t-label post-card__meta">
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
