import DateFormatter from "./date-formatter";
import Link from "next/link";
import Image from "next/image";

export default function Posts({ posts }) {
  return (
    <>
      {posts.map((post) => (
        <section className="post">
          <div className="inline-post">
            <h3>
              <Link as={`/${post.slug}`} href="/[slug]">
                <a>{post.title}</a>
              </Link>
            </h3>
            <DateFormatter dateString={post.date} />
          </div>
        </section>
      ))}
    </>
  );
}
