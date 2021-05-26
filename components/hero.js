import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function Hero() {
  return (
    <div className="author">
      <h2>Hi, I am Edwin.</h2>
      <p>I love to share my knowledge on technology with in-depth articles.</p>
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
          <FontAwesomeIcon icon={["fab", "github"]} />
        </div>
        <div className="icon">
          <FontAwesomeIcon icon={["fab", "linkedin"]} />
        </div>
        <div className="icon">
          <FontAwesomeIcon icon={["fab", "twitter"]} />
        </div>
        <div className="icon">
          <FontAwesomeIcon icon={["fab", "spotify"]} />
        </div>
        <div className="icon">
          <FontAwesomeIcon icon={["fas", "envelope"]} />
        </div>
      </div>
    </div>
  );
}
