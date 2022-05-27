import Link from "next/link";
import DarkModeToggle from "./dark-mode";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  return (
    <header>
      <nav>
      <DarkModeToggle />
        {router.pathname !== "/" && (
          <Link href="/">
            <a>Back</a>
          </Link>
        )}
      </nav>
    </header>
  );
}
