import React from 'react';
import { useGalleryPosts } from '../../hooks/useGalleryPosts.js';
import MainGalleryPostCard from '../MainGalleryPostCard/MainGalleryPostCard.js';
import '../Gallery/Gallery.css';
import Menu from '../Menu/Menu.js';
import { signOut } from '../../services/auth.js';
import { useUser } from '../../hooks/useUser.js';
import Loading from '../Loading/Loading.js';

export default function MainGallery() {
  const { posts, loading } = useGalleryPosts();
  const { setUser } = useUser();

  if (loading) {
    return <Loading />;
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
      <div className="up-top-msg">
        <p>HALLOWEEN SALE 30% OFF UNTIL NOV 1!!!</p>
        <span>Please hit me up with offers or questions! </span>
        <span>
          <a href="mailto:kevin@kevinnail.com">Email</a> or{' '}
          <a href="https://www.instagram.com/stresslessglass">DM</a> me!
        </span>
      </div>
      <div className="gallery-list-container">
        {posts.map((post) => (
          <MainGalleryPostCard key={post.id} {...post} posts={posts} />
        ))}
      </div>
    </>
  );
}
