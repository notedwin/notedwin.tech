import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "./components/ne";

export const metadata: Metadata = {
	title: "Page not found",
	description: "This page doesn't exist, or it moved.",
};

export default function NotFound() {
	return (
		<main id="main">
			<PageHead title="Page not found" note="status:404">
				<p className="ne-pagehead__lede">This page doesn’t exist, or it moved. Older posts now live under /blog.</p>
			</PageHead>
			<p className="stack-links">
				<Link className="more-link" href="/blog">
					› read the blog
				</Link>
				<Link className="more-link" href="/">
					› go home
				</Link>
			</p>
		</main>
	);
}
