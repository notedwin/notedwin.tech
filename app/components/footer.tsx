import { socialLinks } from "app/config";

// Bump on every redesign (design system: README → Name and header). Kept in source, not shown.
export const SITE_VERSION = { v: 9, date: "2026-10-30" };

const links = [
	{ href: socialLinks.github, name: "github" },
	{ href: socialLinks.linkedin, name: "linkedin" },
	{ href: socialLinks.substack, name: "substack" },
	{ href: socialLinks.spotify, name: "spotify" },
	{ href: "/rss.xml", name: "rss" },
];

export default function Footer() {
	return (
		<footer className="site-footer">
			<p className="site-footer__links">
				{links.map(({ href, name }) => (
					<a key={name} href={href} {...(href.startsWith("http") && { rel: "me noopener noreferrer" })}>
						{name}
					</a>
				))}
			</p>
		</footer>
	);
}
