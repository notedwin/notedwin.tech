import HeroPost from './hero-post'

export default function MoreStories({ posts }) {
  return (
    <>
        {posts.map((post) => (
          <HeroPost
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
    </>
  )
}