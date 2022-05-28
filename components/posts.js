import DateFormatter from "./date-formatter";
import Link from "next/link";
import Image from "next/image";

export default function Posts({ posts }) {
  return (
    <>
      {posts.map((post) => (
        <Link as={`/${post.slug}`} href="/[slug]">
          <div className="box">
          <div>
            <Link as={`/${post.slug}`} href="/[slug]">
                <h3 className="post-title">{post.title}</h3>
            </Link>
          </div>
          <div style={{ position: "relative", minHeight: "200px" }}>
            <Image
              className="img"
              src={post.image}
              layout="fill"
              alt="post.title"
              objectFit="cover"
            />
          </div>
          <p>{post.excerpt}</p>
          </div>
        </Link>
      ))}
    </>
  );
}
