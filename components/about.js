import Image from "next/image";

export default function About() {
  return (
    <article>
        <h1>About</h1>
        <div className="about">
          <p>Hello!</p>
          <p>
            I'm Edwin, a Software Engineer based in the Chicago. I'm
            currently working at Deloitte as a Soutions Engineer.
          </p>
          <p>
            I graduated from the <a href="https://www.iit.edu">Illinois Institute of Technology</a> with a Bachelors degree in Computer Science.
          </p>
          <p>
          I previously worked at Cox Automotive, Engineering Enablement as a Software Engineer where I worked on creating insights into cost and security for engineering teams using Python, Terraform, and AWS. Other jobs include being a software developer for Illinois Tech's Idea Shop, and a software engineer for HaxML, an online sports Analytics platform.
          </p>
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
