import Link from "next/link";
import DarkModeToggle from "./dark-mode";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  return (
    <header>
      <nav>
        {router.pathname !== "/" && (
          <>
            <Link href="/">
              <a>Home</a>
            </Link>
            <div>
              <Link href="/about">
                <a>About</a>
              </Link>
              <DarkModeToggle />
            </div>
          </>
        )}
        {router.pathname === "/" && (
          <>
            <Link href="/about">
              <a>About</a>
            </Link>
            <DarkModeToggle />
          </>
        )}
      </nav>
    </header>
  );
}
