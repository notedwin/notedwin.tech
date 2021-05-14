import Link from "next/link";

export default function Navbar() {
  return (
    <header>
      <div className="navbar">
        <nav className="menu">
          <a Link href="/">
            <h1>Edwin Zamudio</h1>
          </a>
          <Link href="/">
            <a className="menu-link">projects</a>
          </Link>

          <Link href="/">
            <a className="menu-link">about</a>
          </Link>
        </nav>
      </div>
    </header>
  );
}
