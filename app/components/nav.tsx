"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// "log" is the blog; its URLs stay under /blog so old links keep working.
const items = [
	{ href: "/", name: "home" },
	{ href: "/blog", name: "log" },
	{ href: "/projects", name: "projects" },
	{ href: "/photos", name: "photos" },
];

export function Nav() {
	let pathname = usePathname();
	let current = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
	return (
		<nav className="ne-nav" aria-label="main">
			{items.map(({ href, name }) => (
				<Link key={href} href={href} aria-current={current(href) ? "page" : undefined}>
					{name}
				</Link>
			))}
		</nav>
	);
}
