import { useRouter } from "next/router";
import ErrorPage from "next/error";

import PostBody from "../components/post-body";
import { getPostBySlug, getAllPosts } from "../lib/api";
import Head from "next/head";
import markdownToHtml from "../lib/markdownToHtml";
import Navbar from "../components/navbar";

import DateFormatter from "../components/date-formatter";
import Meta from "../components/meta";

export default function Post({ post}) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <>
      <Meta />
      <main>
        <Navbar />
        <>
          {router.isFallback ? (
            <H1>Loading... </H1>
          ) : (
            <>
              <article>
                <Head>
                  <title>{post.title}</title>
                  <meta property="og:image" content={post.image} />
                </Head>
                <h1 className="postTitle">{post.title}</h1>
                <DateFormatter dateString={post.date} />
                <PostBody content={post.content} />
              </article>
            </>
          )}
        </>
      </main>
    </>
  );
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug, [
    "title",
    "date",
    "slug",
    "author",
    "content",
    "image",
  ]);
  const content = await markdownToHtml(post.content || "");

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(["slug"]);

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
} 