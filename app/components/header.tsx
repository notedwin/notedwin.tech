import Link from "next/link";
import { Flame } from "../_design/react/flame";
import { ThemeToggle } from "../_design/react/theme-toggle";
import { Nav } from "./nav";

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
