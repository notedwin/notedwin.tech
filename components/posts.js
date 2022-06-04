import DateFormatter from "./date-formatter";
import Link from "next/link";
import Image from "next/image";

export default function Posts({ posts }) {
  return (
    <>
      {posts.map((post) => (
        <section className="post">
          <div className="inline-post">
            <div>
              <h3>
                <Link as={`/posts/${post.slug}`} href="/posts/[slug]">
                  <a>{post.title}</a>
                </Link>
              </h3>
              <p>{post.excerpt}</p>
            </div>

            <DateFormatter dateString={post.date} />
          </div>
        </section>
      ))}
    </>
  );
}
