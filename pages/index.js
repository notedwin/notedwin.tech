
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
        <div className="basic-grid">
          <Hero />
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
