
import Navbar from "../components/navbar";

import { library, config, dom } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";

// import hero
import Hero from "../components/hero";
import Posts from "../components/posts";
import Head from "next/head";
import Meta from "../components/meta";

import { getAllPosts } from "../lib/api";
library.add(fas, fab);
config.autoAddCss = false;

export default function home({ allPosts }) {
  return (
    <>
      <Meta />
      <main>
        <Head>
          <title>Edwin's Blog</title>
          <link rel="icon" href="/logo.svg" />
          <style>{dom.css()}</style>
        </Head>
        <Navbar />
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
        <Hero />
        <div>
          <>{allPosts.length > 0 && <Posts posts={allPosts} />}</>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const allPosts = getAllPosts(["title", "date", "slug", "image", "excerpt"]);

  return {
    props: { allPosts },
  };
}
