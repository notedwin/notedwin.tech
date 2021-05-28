import DateFormatter from "../components/date-formatter";
import CoverImage from "../components/cover-image";
import PostTitle from "../components/post-title";

export default function PostHeader({ title, coverImage, date }) {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <DateFormatter dateString={date} />
      <div className="postImage">
        <CoverImage title={title} src={coverImage} />
      </div>
    </>
  );
}
