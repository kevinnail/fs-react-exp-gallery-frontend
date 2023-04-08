import React from 'react';
import { useGalleryPosts } from '../../hooks/useGalleryPosts.js';
// import CoolSearchBox from '../CoolSearchBox/CoolSearchBox.js';
import MainGalleryPostCard from '../MainGalleryPostCard/MainGalleryPostCard.js';
import '../Gallery/Gallery.css';
import Menu from '../Menu/Menu.js';
import { signOut } from '../../services/auth.js';
// import './MainGallery.css';
import { useUser } from '../../hooks/useUser.js';

export default function MainGallery() {
  const { posts, loading } = useGalleryPosts();
  const { setUser } = useUser();

  if (loading) {
    return (
      <div className="loading-div-wrapper">
        <div className="loading-div">
          <img className="rotating-marble" src="../marble-css.png" />
        </div>
      </div>
    );
  }

  const handleClick = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <>
      <div className="menu-search-container">
        <Menu handleClick={handleClick} />
      </div>

      <div className="gallery-list-container">
        {posts.map((post) => (
          <MainGalleryPostCard key={post.id} {...post} posts={posts} />
        ))}
      </div>
    </>
  );
}
