import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function Hero() {
	return (
		<>
			<div className="header">
				<h2>
					Hi, I am{" "}
					<Link href="/about" passHref>
						<a className="namelink">Edwin Zamudio</a>
					</Link>
				</h2>

				<p>Data Engineer @ Amgen.</p>
				<div>
					<div className="icon">
						<a href="https://github.com/notedwin">
							<FontAwesomeIcon icon={["fab", "github"]} />
						</a>
					</div>
					<div className="icon">
						<a href="https://linkedin.com/in/edwin-zamudio">
							<FontAwesomeIcon icon={["fab", "linkedin"]} />
						</a>
					</div>
					<div className="icon">
						<a href="https://open.spotify.com/user/zamudio.e13">
							<FontAwesomeIcon icon={["fab", "spotify"]} />
						</a>
					</div>
					<div className="icon">
						<a href="https://are.na/notedwin">
							<FontAwesomeIcon icon={["fa", "microchip"]} />
						</a>
					</div>
				</div>
			</div>
		</>
	);
}
