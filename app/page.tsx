import type { Metadata } from "next";
import Link from "next/link";
import { metaData } from "./config";
import { feedTypes, jsonLd, ogImages, person, twitterHandle, twitterImage } from "./lib/seo";
import { Cube } from "./components/cube";
import { CommitLine } from "./components/commit-line";
import { SectionHead } from "./components/ne";
import { PostCard } from "./components/post-card";
import { getBlogPosts, type Post } from "./lib/posts";

// The posts the home grid shows, in this order: two rows of three, the same cards as /blog.
const homeSlugs = ["homelab-2026", "homelab-2025", "thunderbolt", "attack-map", "health-data", "haxml"];

// The one page whose title and description carry the full name, so a search for it finds the
// site without the name on every page. Other pages keep "<title> · notedwin".
const homeTitle = `${metaData.name}: homelab, data and ML notes`;
const homeDescription = `${metaData.name}'s notes on running a homelab, data engineering and ML: what I built, what it cost and what broke.`;

export const metadata: Metadata = {
	title: { absolute: homeTitle },
	description: homeDescription,
	alternates: { canonical: "/", types: feedTypes },
	openGraph: {
		title: homeTitle,
		description: homeDescription,
		url: metaData.baseUrl,
		siteName: metaData.siteName,
		locale: "en_US",
		type: "profile",
		firstName: "Edwin",
		lastName: "Zamudio",
		username: "notedwin",
		images: ogImages(homeTitle),
	},
	twitter: {
		card: "summary_large_image",
		site: twitterHandle,
		creator: twitterHandle,
		title: homeTitle,
		description: homeDescription,
		images: twitterImage(homeTitle),
	},
};

const siteJsonLd = jsonLd({
	"@graph": [
		{
			"@type": "WebSite",
			"@id": `${metaData.baseUrl}/#website`,
			url: metaData.baseUrl,
			name: metaData.siteName,
			description: homeDescription,
			inLanguage: "en",
			author: { "@id": person["@id"] },
		},
		// Marks the home page as a profile of the person, the markup Google reads for name searches.
		{
			"@type": "ProfilePage",
			"@id": `${metaData.baseUrl}/#profile`,
			url: metaData.baseUrl,
			name: homeTitle,
			isPartOf: { "@id": `${metaData.baseUrl}/#website` },
			mainEntity: { "@id": person["@id"] },
		},
		// Given and family name plus employer tell this Edwin Zamudio apart from others in search.
		{
			...person,
			givenName: "Edwin",
			familyName: "Zamudio",
			jobTitle: "Data and ML engineer",
			worksFor: { "@type": "Organization", name: "McDonald's" },
			knowsAbout: ["homelab", "data engineering", "machine learning"],
		},
	],
});

export default function Page() {
	let posts = getBlogPosts();
	let picked = homeSlugs
		.map((slug) => posts.find((post) => post.slug === slug))
		.filter((post): post is Post => post !== undefined);

	return (
		<main id="main" className="home">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteJsonLd }} />
			<section className="intro" aria-label="intro">
				<div>
					<h1 className="intro__lede">
						Hey, I’m Edwin, currently doing data and ML things at{" "}
						<a className="ne-link" href="https://www.mcdonalds.co.jp/" rel="noopener noreferrer">
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
				<ul className="post-grid">
					{picked.map((post) => (
						<li key={post.slug}>
							<PostCard post={post} />
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
