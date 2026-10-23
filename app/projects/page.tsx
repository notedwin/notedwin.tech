import type { Metadata } from "next";
import { pageMetadata } from "app/lib/seo";
import { PageHead, Status } from "app/components/ne";
import { projects } from "./project-data";

export const metadata: Metadata = pageMetadata({
	title: "Projects",
	description: "Things I've built: homelab config, data tools and small sites.",
	path: "/projects",
});

export default function Projects() {
	let sorted = [...projects].sort((a, b) => b.year - a.year);
	return (
		<main id="main">
			<PageHead title="Projects" note={`${projects.length} projects`} />
			<ul className="ne-rows project-list">
				{sorted.map((p) => {
					let external = p.url.startsWith("http");
					return (
						<li key={p.title}>
							<a href={p.url} {...(external && { rel: "noopener noreferrer" })}>
								<p className="t-meta row-meta">
									{p.year} · <Status state={p.status} />
								</p>
								<h2 className="t-h3 row-title">
									{p.title}
									<span className="row-arrow" aria-hidden="true">
										{external ? "↗" : "→"}
									</span>
								</h2>
								<p className="t-body-sm muted">
									{p.stat && <strong className="row-stat">{p.stat}</strong>} {p.description}
								</p>
							</a>
						</li>
					);
				})}
			</ul>
		</main>
	);
}
