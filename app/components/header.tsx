import Link from "next/link";
import { Flame } from "./flame";
import { Nav } from "./nav";
import { ThemeToggle } from "./theme-toggle";

// The flame as the home link, then nav and theme toggle.
export function Header() {
	return (
		<header className="site-header">
			<div className="ne-header">
				<Link className="ne-lockup" href="/" aria-label="notedwin, home">
					<Flame animate />
				</Link>
				<div className="ne-header__right">
					<Nav />
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
