import Link from "next/link";
import { getLatestCommit } from "app/lib/github";
import { Flame } from "./flame";
import { Nav } from "./nav";
import { ThemeToggle } from "./theme-toggle";
import { RelativeTime } from "./relative-time";

// Lockup, nav and theme toggle, then the commit line across the column.
export async function Header() {
	let commit = await getLatestCommit();
	return (
		<header className="site-header">
			<div className="ne-header">
				<Link className="ne-lockup" href="/" aria-label="notedwin, home">
					<Flame animate />
					<span>notedwin</span>
				</Link>
				<div className="ne-header__right">
					<Nav />
					<ThemeToggle />
				</div>
				{commit && (
					<p className="ne-commit">
						<span className="lead">recently committed</span>
						<span aria-hidden="true">·</span>
						<a href={commit.repoUrl}>{commit.repo}</a>
						<span aria-hidden="true">·</span>
						<code title={commit.message}>
							<a href={commit.url}>{commit.message}</a>
						</code>
						<span aria-hidden="true">·</span>
						<RelativeTime date={commit.date} />
					</p>
				)}
			</div>
		</header>
	);
}
