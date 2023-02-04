import Head from "next/head";
import Navbar from "../components/navbar";
import Meta from "../components/meta";

export default function ResumePage() {
  return (
    <>
      <Meta />
      <Head>
        <title>Edwin Zamudio</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <article>
        <h1>About Me</h1>
        <div className="about">
          <p>Hey there!</p>
          <p>
            I'm Edwin, a Software Engineer based in the Chicago. I'm currently
            working at Deloitte as a Data Engineer. I'm interested in building efficient backend systems, and data pipelines.
          </p>
          In my free time, I enjoy playing soccer, biking and learning new things, like building small data systems like <a href="https://map.notedwin.com"> this </a>.
          <p>
            I previously worked at Cox Automotive where I created data pipelines
            to create alerts for cost and security issues using Python,
            Terraform, and AWS. Previous jobs include being a software developer
            for Illinois Tech's Idea Shop, and a software engineer for HaxML, an
            online sports Analytics platform.
          </p>
          <p>
            You can
            <a href="http://github.com/notedwin/notedwin.tech/issues/new"> report </a>
            if there is a broken link(s) or something else.
          </p>
          <h3>This Website</h3>
          <p>
            This website is built with Next.js, and hosted on Vercel. However, this website is very simple as most pages are markdown files.
          </p>
        </div>
      </article>
    </>
  );
}
