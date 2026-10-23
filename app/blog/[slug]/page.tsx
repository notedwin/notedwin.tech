import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CustomMDX } from "app/components/mdx";
import { SectionHead } from "app/components/ne";
import { PostCard, pairSizes } from "app/components/post-card";
import { getBlogPosts, getTags, isoDate, readNext, type Post } from "app/lib/posts";
import { metaData } from "app/config";
import { absoluteUrl, feedTypes, jsonLd, ogImageUrl, person, postDescription } from "app/lib/seo";

// Who wrote it, when, and what it is about, so search and AI tools can quote it with attribution.
function postJsonLd(post: Post) {
	let { title, publishedAt, updated, image } = post.metadata;
	let url = absoluteUrl(`/blog/${post.slug}`);
	return jsonLd({
		"@type": "BlogPosting",
		"@id": `${url}#post`,
		headline: title,
		description: postDescription(post),
		datePublished: publishedAt,
		dateModified: updated || publishedAt,
		image: image ? absoluteUrl(image) : ogImageUrl(title),
		url,
		mainEntityOfPage: url,
		inLanguage: "en",
		keywords: getTags(post).join(", "),
		wordCount: post.content.split(/\s+/).length,
		author: person,
		publisher: { "@id": person["@id"] },
		isPartOf: { "@type": "Blog", "@id": absoluteUrl("/blog#blog"), name: metaData.siteName, url: absoluteUrl("/blog") },
	});
}

export async function generateStaticParams() {
	return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }): Promise<Metadata | undefined> {
	const { slug } = await params;
	let post = getBlogPosts().find((post) => post.slug === slug);
	if (!post) {
		return;
	}

	let { title, publishedAt, updated, image } = post.metadata;
	let description = postDescription(post);
	let ogImage = image ? absoluteUrl(image) : ogImageUrl(title);
	let path = `/blog/${post.slug}`;

	return {
		title,
		description,
		keywords: getTags(post),
		alternates: { canonical: path, types: feedTypes },
		openGraph: {
			title,
			description,
			type: "article",
			publishedTime: publishedAt,
			modifiedTime: updated || publishedAt,
			authors: [metaData.baseUrl],
			tags: getTags(post),
			url: path,
			siteName: metaData.siteName,
			locale: "en_US",
			images: [image ? { url: ogImage, alt: title } : { url: ogImage, width: 1200, height: 630, alt: title }],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImage],
		},
	};
}

export default async function Blog({ params }) {
	const { slug } = await params;
	let post = getBlogPosts().find((post) => post.slug === slug);

	if (!post) {
		notFound();
	}

	let { title, summary, publishedAt, updated, domain } = post.metadata;
	let next = readNext(post);

	return (
		<main id="main" data-domain={domain}>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: postJsonLd(post) }} />
			<header className="post-head">
				<h1 className="post-head__title">{title}</h1>
				{summary && <p className="post-head__summary">{summary}</p>}
				<p className="t-meta post-head__meta">
					<time dateTime={publishedAt}>{isoDate(publishedAt)}</time>
					{updated && (
						<>
							{" "}
							· updated <time dateTime={updated}>{isoDate(updated)}</time>
						</>
					)}
				</p>
			</header>
			<div className="post-body">
				<article className="ne-prose">
					<CustomMDX source={post.content} />
				</article>
			</div>
			<div className="post-foot">
				<p className="t-body-sm muted">thanks for reading.</p>
				<section className="read-next" aria-labelledby="read-next">
					<SectionHead
						id="read-next"
						title="read next"
						note={
							<Link className="sh-link" href="/blog">
								all posts →
							</Link>
						}
					/>
					<ul className="post-grid post-grid--pair">
						{next.map((p) => (
							<li key={p.slug}>
								<PostCard post={p} sizes={pairSizes} />
							</li>
						))}
					</ul>
				</section>
			</div>
		</main>
	);
}
