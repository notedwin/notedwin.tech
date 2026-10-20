import Link from "next/link";
import { Cube } from "./components/cube";
import { DitherPhoto } from "./components/dither";
import { CommitLine } from "./components/commit-line";
import { DomainMark, SectionHead, Status } from "./components/ne";
import { getBlogPosts, getFirstImage, isoDate } from "./lib/posts";
import { featured } from "./projects/project-data";

export default function Page() {
	let posts = getBlogPosts();
	let report = posts[0];
	let reportImage = getFirstImage(report);

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

			<section className="home-section" aria-labelledby="workbench">
				<SectionHead id="workbench" title="workbench" note="field reports" />
				<div className="workbench">
					<div>
						<article className="ne-report">
								<svg className="ne-report__clip" viewBox="0 0 22 66" aria-hidden="true">
									<path d="M6 60 V10 a5 5 0 0 1 10 0 V52 a3 3 0 0 1 -6 0 V18" />
								</svg>
								<h3 className="ne-report__title">{report.metadata.title.split(":")[0]}</h3>
								<div className="report__bottom">
									<p className="ne-report__body">
										field report · {report.metadata.domain} · {isoDate(report.metadata.publishedAt)}
										<br />
										{report.metadata.summary}
									</p>
									{reportImage && (
										<DitherPhoto src={reportImage} alt="" sizes="110px" className="plate-110" />
									)}
								</div>
								<span className="ne-tear" aria-hidden="true" />
							</article>
						<Link className="more-link" href={`/blog/${report.slug}`}>
							› open the workbench
						</Link>
					</div>
					<ul className="project-rows">
						{featured.map((p) => (
							<li key={p.title}>
								<DitherPhoto src={p.image!} alt={p.imageAlt!} sizes="110px" className="plate-110" />
								<div>
									<p className="t-meta row-meta">
										{p.year} · <DomainMark domain={p.domain} /> · <Status state={p.status} />
									</p>
									<h3 className="t-h3">
										<a href={p.url} className="row-title">
											{p.title}
										</a>
									</h3>
									<p className="t-body-sm muted">{p.description}</p>
								</div>
							</li>
						))}
					</ul>
				</div>
			</section>

		</main>
	);
}
