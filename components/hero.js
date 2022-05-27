import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="header">
      <h1>
        Hi, I am{" "}
        <Link href="/about" passHref>
          <a className="namelink">Edwin Zamudio</a>
        </Link>
        .
      </h1>
      <p>Data Engineer @ Deloitte Consulting.</p>
      <section id="visual">
        <div id="cube">
          <img
            className="face-0"
            alt="Cube Face Top"
            src="/assets/img/4.png"
            width="768"
            height="768"
          />
          <img
            className="face-1"
            alt="Cube Face Front"
            src="/assets/img/4.png"
            width="768"
            height="768"
          />
          <img
            className="face-2"
            alt="Cube Face Right"
            src="/assets/img/4.png"
            width="768"
            height="768"
          />
          <img
            className="face-3"
            alt="Cube Face Back"
            src="/assets/img/4.png"
            width="768"
            height="768"
          />
          <img
            className="face-4"
            alt="Cube Face Left"
            src="/assets/img/4.png"
            width="768"
            height="768"
          />
          <img
            className="face-5"
            alt="Cube Face Bottom"
            src="/assets/img/4.png"
            width="768"
            height="768"
          />
        </div>
      </section>
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
          <a href="https://twitter.com/edwinzamud">
            <FontAwesomeIcon icon={["fab", "twitter"]} />
          </a>
        </div>
        <div className="icon">
          <a href="https://open.spotify.com/user/zamudio.e13">
            <FontAwesomeIcon icon={["fab", "spotify"]} />
          </a>
        </div>
        <div className="icon">
          <a href="https://www.are.na/notedwin">
            <FontAwesomeIcon icon={["fas", "star"]} />
          </a>
          {/* import svg and make it an icon
        <div className="icon">
          <a href="https://www.instagram.com/edwinzamud/">
            <Image src="/webring.svg" width={40} height={40} />
          </a>
        </div> */}
        </div>
      </div>
    </div>
  );
}
