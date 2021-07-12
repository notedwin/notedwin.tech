import DateFormatter from "../components/date-formatter";
import CoverImage from "../components/cover-image";
import Link from "next/link";

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}) {
  return (
    <section className="post">
      <div className="inline-post">
        <h3>
          <Link as={`/posts/${slug}`} href="/posts/[slug]">
            <a>{title}</a>
          </Link>
        </h3>
        <DateFormatter dateString={date} />
      </div>
    </section>
  );
}

// <div className="ImageDiv">
//<CoverImage title={title} src={coverImage} slug={slug} />
//</div>
