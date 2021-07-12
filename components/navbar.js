import Link from "next/link";
import DarkModeToggle from "./dark-mode";

export default function Navbar() {
  return (
    <header>
      <nav>
          <Link href="/">
            <a>home</a>
          </Link>

          <Link href="/projects">
            <a>projects</a>
          </Link>

          <Link href="/about">
            <a>about</a>
          </Link>
          <DarkModeToggle/>
      </nav>
    </header>
  );
}
