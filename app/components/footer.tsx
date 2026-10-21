import { socialLinks } from "app/config";

// Bump on every redesign (design system: README → Name and header).
export const SITE_VERSION = { v: 7, date: "2026-10-20" };

const links = [
	{ href: socialLinks.github, name: "github" },
	{ href: socialLinks.linkedin, name: "linkedin" },
	{ href: socialLinks.substack, name: "substack" },
	{ href: socialLinks.arena, name: "are.na" },
	{ href: socialLinks.spotify, name: "spotify" },
	{ href: "/rss.xml", name: "rss" },
];

export default function Footer() {
	return (
		<footer className="site-footer">
			<p className="t-body-sm">thanks for reading.</p>
			<p className="site-footer__links">
				{links.map(({ href, name }, i) => (
					<span key={name}>
						{i > 0 && <span aria-hidden="true"> · </span>}
						<a href={href} {...(href.startsWith("http") && { rel: "me noopener noreferrer" })}>
							{name}
						</a>
					</span>
				))}
				<span aria-hidden="true"> · </span>
				<span>
					v{SITE_VERSION.v} · {SITE_VERSION.date}
				</span>
			</p>
		</footer>
	);
}
