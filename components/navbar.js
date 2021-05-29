import Link from "next/link";
import DarkModeToggle from "./dark-mode";

export default function Navbar() {
  return (
    <header>
      <nav>
          <Link href="/">
            <a className="header">Edwin Zamudio</a>
          </Link>
          <Link href="/projects">
            <a>projects</a>
          </Link>

          <Link href="/resume">
            <a>about</a>
          </Link>
          <DarkModeToggle/>
      </nav>
    </header>
  );
}
