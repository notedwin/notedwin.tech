import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function Hero() {
  return (
    <div className="author">
      <h2>Hi, I am Edwin.</h2>
      <p>I love to share my technical ramblings.</p>
      <section id="visual">
        <div id="cube">
          <img
            className="face-0"
            alt="Cube Face Top"
            src="/assets/img/1.png"
            width="768"
            height="768"
          />
          <img
            className="face-1"
            alt="Cube Face Front"
            src="/assets/img/2.png"
            width="768"
            height="768"
          />
          <img
            className="face-2"
            alt="Cube Face Right"
            src="/assets/img/1.png"
            width="768"
            height="768"
          />
          <img
            className="face-3"
            alt="Cube Face Back"
            src="/assets/img/1.png"
            width="768"
            height="768"
          />
          <img
            className="face-4"
            alt="Cube Face Left"
            src="/assets/img/1.png"
            width="768"
            height="768"
          />
          <img
            className="face-5"
            alt="Cube Face Bottom"
            src="/assets/img/2.png"
            width="768"
            height="768"
          />
        </div>
      </section>
      <div className="icon-wrapper">
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
          <a href="https://open.spotify.com/user/zamudio.e13?si=NYn_7WclQmmVBfb6wJ7xqA">
            <FontAwesomeIcon icon={["fab", "spotify"]} />
          </a>
        </div>
      </div>
    </div>
  );
}
