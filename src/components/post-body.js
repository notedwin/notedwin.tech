import React from 'react';
export default function PostBody({ content }) {
  return (
    <div>
      <div
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}