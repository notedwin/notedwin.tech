import Layout from "../components/layout";
import Navbar from "../components/navbar";

export default function Projects() {
  return (
    <Layout>
      <Navbar />
      <article /*class="basic-grid"*/>
        <div>
          <h2>Cyberattack Map</h2>
          <a href="https://github.com/notedwin/attack-map">Github repository</a>
          <br />
          <a href="https://edwin.computer/attack-map/">
            Blog Post for Cyber Attack Map
          </a>
          <div className="embed-responsive">
            <iframe src="https://map.edwin.computer" />
          </div>

          <p>
            I wanted to generate a world map that showed all the people who were
            trying to break into my raspberry pi that hosts this website.
          </p>
          <p>
            This project took many iterations due to complications but I have a
            working product now.
          </p>
        </div>
        <div>
          <h2>Restaurant Application</h2>
          <a href="https://restaurant.edwin.computer">Live website</a>
          <br />
          <a href="http://github.com/notedwin/restaurant-app">
            Github Repository
          </a>
          <div className="embed-responsive">
            <iframe width="100%" height="300" src="https://restaurant.edwin.computer" />
          </div>
          <p>Project for my software engineering class.</p>
        </div>
      </article>
    </Layout>
  );
}
