import Image from "next/image";

export default function About() {
  return (
    <>
      <div className="inline">
        <h1>About</h1>
        <div className="about">
          <a href="/assets/Edwin-Zamudio-Resume.pdf">
            Download a PDF of my resume.
          </a>
          <p>Howdy!</p>
          <p>
            I am a senior studying Computer Science at
            <a href="https://www.iit.edu"> Illinois Tech</a>.
          </p>
          <p>
            I am actively seeking an full-time software engineering position to
            start after December 2021.
          </p>
          <p>
            During the school semesters, I keep myself busy by working on
            multiple production Flask applications for Illinois Tech's Idea Shop
            which helps manage students at our campus maker space. If I am not
            working at the Idea Shop, I am working on personal projects or
            attending hackathons.
          </p>
          <p>
            I’m interested in improving the efficiency, scalability and security
            of back-end applications and infrastructure.
          </p>
          <p>
            I have multiple years of programming experience in Python and
            JavaScript. I love working with Python and Linux.
          </p>
          <p>
            You can
            <a href="http://github.com/notedwin/edwin.computer/issues/new">
              {" "}
              report{" "}
            </a>
            if there is a broken link(s) or something else.
          </p>
          <h3>
            <a id="tech" className="anchor" aria-hidden="true" href="#tech"></a>
            Tech:
          </h3>
          <p>
            <a href="https://www.lenovo.com/us/en/laptops/thinkpad/thinkpad-t-series/ThinkPad-T480s/p/22TP2TT480S">
              ThinkPad T480s - Ubuntu 20.04
            </a>
          </p>
          <p>
            <a href="">Raspberry Pi 4B - 4GB</a>
          </p>
          <p>I5-6600k with GTX970 Desktop.</p>
          <p>IPhone 4s</p>
        </div>
      </div>
    </>
  );
}
