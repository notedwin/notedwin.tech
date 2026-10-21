"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
	{ href: "/", name: "home" },
	{ href: "/blog", name: "blog" },
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
