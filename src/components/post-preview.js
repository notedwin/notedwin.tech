import DateFormatter from '../components/date-formatter'
import CoverImage from './cover-image'
import React from 'react';
import { Link } from 'gatsby';

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  slug,
}) {
  return (
    <>
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
      <div className="heroImageDiv">
        <CoverImage
          title={title}
          src={coverImage}
          slug={slug}
        />
      </div>
    </>
  )
}