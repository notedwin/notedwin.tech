import React from 'react';
import DateFormatter from "../components/date-formatter";
import CoverImage from "../components/cover-image";
import { Link } from 'gatsby';

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  slug,
}) {
  return (
    <section className="post">
      <div>
        <div>
          <h3>
            <Link as={`/posts/${slug}`} href="/posts/[slug]">
              <a>{title}</a>
            </Link>
          </h3>
          <div>
            <DateFormatter dateString={date} />
          </div>
        </div>
        <div>
          <p>{excerpt}</p>
        </div>
      </div>
      <div className="ImageDiv">
        <CoverImage title={title} src={coverImage} slug={slug} />
      </div>
    </section>
  );
}
