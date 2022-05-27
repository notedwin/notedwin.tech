import Layout from "../components/layout";
import Navbar from "../components/navbar";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library, config, dom } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

// import hero
import Hero from "../components/hero";
import Container from "../components/container";
import Posts from "../components/posts";
import Head from "next/head";

import { getAllPosts } from "../lib/api";
library.add(fas, fab);
config.autoAddCss = false;

export default function home({ allPosts }) {
  return (
    <Layout>
      <Head>
        <title>Edwin's Blog</title>
        <link rel="icon" href="/logo.svg" />
        <style>{dom.css()}</style>
      </Head>
      <Navbar />
      <div className="basic-grid">
        <Hero />
        <div className="box">
          <div className="inline-post">
            <Image
              className="img"
              src="/map2.png"
              width="150"
              height="150"
              alt="post.title"
            />
            <div>
              <h2>Attack Map</h2>
              <a href="https://github.com/notedwin/attack-map">Github</a>
            </div>
            <p>SSH failed login attempts mapped using Rust and Redis.</p>
            <Link href="/posts/attack-map/">
              <a className="btn">Read More ...</a>
            </Link>
          </div>
        </div>
        <Container>
          {allPosts.length > 0 && <Posts posts={allPosts} />}
        </Container>
      </div>
    </Layout>
  );
}


export async function getStaticProps() {
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "image",
    "excerpt",
  ]);

  return {
    props: { allPosts },
  };
}
