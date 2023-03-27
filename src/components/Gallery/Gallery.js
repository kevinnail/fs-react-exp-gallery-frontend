import React from 'react';
import { usePosts } from '../../hooks/usePosts.js';
// import { useUser } from '../../hooks/useUser.js';
import GalleryPostCard from '../GalleryPostCard/GalleryPostCard.js';
import './Gallery.css';

export default function Gallery() {
  // const { user } = useUser();
  const { posts, loading } = usePosts();

  if (loading) {
    return (
      <div className="loading">
        <h1>Loading! One moment please!</h1>
      </div>
    );
  }
  return (
    <>
      <div className="gallery-list-container">
        {posts.map((post) => (
          <GalleryPostCard key={post.id} {...post} posts={posts} />
        ))}
      </div>
    </>
  );
}
