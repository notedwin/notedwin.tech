import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CustomMDX } from "app/components/mdx";
import { Meta, Status, Tag } from "app/components/ne";
import { getBlogPosts, getTags, isoDate } from "app/lib/posts";
import { metaData } from "app/config";

export async function generateStaticParams() {
	return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }): Promise<Metadata | undefined> {
	const { slug } = await params;
	let post = getBlogPosts().find((post) => post.slug === slug);
	if (!post) {
		return;
	}

	let { title, publishedAt: publishedTime, summary: description, image } = post.metadata;
	let ogImage = image ? image : `${metaData.baseUrl}/og?title=${encodeURIComponent(title)}`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "article",
			publishedTime,
			url: `${metaData.baseUrl}/blog/${post.slug}`,
			images: [{ url: ogImage }],
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

	let { title, summary, publishedAt, updated, domain, status } = post.metadata;
	let tags = getTags(post);

	return (
		<main id="main" data-mode="workbench" data-domain={domain}>
			<script
				type="application/ld+json"
				suppressHydrationWarning
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BlogPosting",
						headline: title,
						datePublished: publishedAt,
						dateModified: updated || publishedAt,
						description: summary,
						image: post.metadata.image
							? `${metaData.baseUrl}${post.metadata.image}`
							: `/og?title=${encodeURIComponent(title)}`,
						url: `${metaData.baseUrl}/blog/${post.slug}`,
						author: {
							"@type": "Person",
							name: metaData.name,
						},
					}),
				}}
			/>
			<header className="post-head">
				<p className="t-label post-head__kicker">
					<Link href="/blog">log</Link> · {isoDate(publishedAt)}
				</p>
				<h1 className="post-head__title">{title}</h1>
				{summary && <p className="post-head__summary">{summary}</p>}
			</header>
			<div className="workbench-page">
				<aside className="rail" aria-label="about this post">
					<div className="ne-meta-list ne-meta-list--stack">
						<Meta k="domain">{domain}</Meta>
						<span className="ne-meta">
							<span className="ne-meta__key">status</span>
							<Status state={status} />
						</span>
						<Meta k="published">{isoDate(publishedAt)}</Meta>
						{updated && <Meta k="updated">{isoDate(updated)}</Meta>}
					</div>
					{tags.length > 0 && (
						<p className="rail__tags">
							{tags.map((t) => (
								<Tag key={t} domain={domain}>
									{t}
								</Tag>
							))}
						</p>
					)}
				</aside>
				<article className="ne-prose">
					<CustomMDX source={post.content} />
				</article>
			</div>
			<p className="post-foot">
				<Link className="more-link" href="/blog">
					← all entries
				</Link>
			</p>
		</main>
	);
}
