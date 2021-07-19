import Image from "next/image";

export default function About() {
  return (
    <article>
        <h1>About</h1>
        <div className="about">
          <p>Hello!</p>
          <p>
            I am a student studying Computer Science at
            <a href="https://www.iit.edu"> Illinois Tech</a> pursuing a bachelors of science in Computer Science. I am an aspiring Back-end Software Engineer with interests in cloud-computing and security.
          </p>
          <p>
          I am currently working as a Software Engineering Intern at Cox Automotive under Engineering Enablement team building upon their AWS data aggregation tooling. 
          </p>
          <p>
            I have previously worked as Software developer for Illinois Tech's Idea Shop, Software Engineer for HaxML, an online sports Analytics platform.
          </p>
          <p>
            I am actively seeking full-time software engineering position to
            start after December 2021.
          </p>
          <a href="/assets/Edwin-Zamudio-Resume.pdf">
            Download a PDF of my resume.
          </a>
          <p>
            You can
            <a href="http://github.com/notedwin/notedwin.tech/issues/new">
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
    </article>
  );
}
