import DateFormatter from "../components/date-formatter";
import PostTitle from "../components/post-title";
import React from 'react';


export default function PostHeader({ title, date }) {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <DateFormatter dateString={date} />
    </>
  );
}
