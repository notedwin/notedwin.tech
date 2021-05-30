import React from 'react';
import DarkModeToggle from "./dark-mode";
import { Link } from 'gatsby';

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

          <Link href="/about">
            <a>about</a>
          </Link>
          <DarkModeToggle/>
      </nav>
    </header>
  );
}
