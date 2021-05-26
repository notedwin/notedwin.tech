import Link from "next/link";

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
      </nav>
    </header>
  );
}
