import React from "react"
import { Link } from 'gatsby';
import { Img } from "gatsby-plugin-image"


export default function CoverImage({ title, src, slug, height, width }) {
  const image = (
    <Img
      src={src}
      alt={`Cover Image for ${title}`}
      layout="fill"
      className="heroImage"
    />
  )
  return (
    <>
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a aria-label={title}>{image}</a>
        </Link>
      ) : (
        image
      )}
    </>
  )
}