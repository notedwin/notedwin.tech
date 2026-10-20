import Link from "next/link";
import { Cube } from "./components/cube";
import { DitherPhoto } from "./components/dither";
import { DomainMark, SectionHead, Status } from "./components/ne";
import { getBlogPosts, getFirstImage, isoDate } from "./lib/posts";
import { featured } from "./projects/project-data";
import { photos } from "./photos/photo-data";

export default function Page() {
	let posts = getBlogPosts();
	let report = posts[0];
	let reportImage = getFirstImage(report);
	// Four newest, plus the start-here entry if it's older, in date order.
	let start = posts.find((p) => p.metadata.start);
	let log = posts.slice(0, start && !posts.slice(0, 5).includes(start) ? 4 : 5);
	if (start && !log.includes(start)) {
		log = [...log, start];
	}

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
					<p className="ne-route">
						networking → security → <span className="is-now">data</span> → quant, eventually
					</p>
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

			<section className="home-section" aria-labelledby="field-photos">
				<SectionHead id="field-photos" title="field photos" note="hover for color" />
				<div className="photo-row">
					{photos.slice(0, 3).map((photo, i) => (
						<figure className="ne-fig" key={photo.src}>
							<DitherPhoto src={photo.src} alt={photo.alt} sizes="(max-width: 768px) 100vw, 260px" className="ratio-3-2" />
							<figcaption>
								<span>
									<b>fig:{String(i + 1).padStart(2, "0")}</b> · {photo.alt}
								</span>
							</figcaption>
						</figure>
					))}
				</div>
				<Link className="more-link" href="/photos">
					all photos →
				</Link>
			</section>

			<section className="home-section" aria-labelledby="log">
				<SectionHead id="log" title="log" note="★ = start here" />
				<ul className="ne-loglist">
					{log.map((post) => (
						<li key={post.slug}>
							<Link href={`/blog/${post.slug}`}>
								<time dateTime={post.metadata.publishedAt}>{isoDate(post.metadata.publishedAt)}</time>
								<span className="ne-loglist__star">
									{post.metadata.start ? <span aria-label="start here">★</span> : null}
								</span>
								<span className="ne-loglist__t">{post.metadata.title}</span>
								<span className="ne-loglist__d" data-domain={post.metadata.domain}>
									{post.metadata.domain}
								</span>
							</Link>
						</li>
					))}
				</ul>
				<Link className="more-link" href="/blog">
					all entries →
				</Link>
			</section>
		</main>
	);
}
