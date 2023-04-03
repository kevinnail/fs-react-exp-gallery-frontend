import React from 'react';
import { useGalleryPosts } from '../../hooks/useGalleryPosts.js';
import CoolSearchBox from '../CoolSearchBox/CoolSearchBox.js';
import MainGalleryPostCard from '../MainGalleryPostCard/MainGalleryPostCard.js';

export default function MainGallery() {
  console.log('MainGallery');
  const { posts, loading } = useGalleryPosts();
  if (loading) {
    return (
      <div className="loading-div">
        {/* <img className="loading" src="../logo-sq.png" /> */}
        <img className="rotating-marble" src="../marble-css.png" />
      </div>
    );
  }
  return (
    <>
      <div className="search-container">{/* <CoolSearchBox onSearch={handleSearch} /> */}</div>
      <div className="gallery-list-container">
        {posts.map((post) => (
          <MainGalleryPostCard key={post.id} {...post} posts={posts} />
        ))}
      </div>
    </>
  );
}
