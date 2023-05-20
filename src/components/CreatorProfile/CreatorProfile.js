import React from 'react';
import './CreatorProfile.css';
import Loading from '../Loading/Loading.js';
import { useGalleryPosts } from '../../hooks/useGalleryPosts.js';
import Menu from '../Menu/Menu.js';
import { useUser } from '../../hooks/useUser.js';
import { signOut } from '../../services/auth.js';
import MainGalleryPostCard from '../MainGalleryPostCard/MainGalleryPostCard.js';

export default function CreatorProfile() {
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
      <div className="gallery-list-container">
        <div className="creator-profile-container">
          <div className="creator-profile-img-container">
            <h1 className="creator-profile-name">Jenny</h1>
            <img
              className="creator-profile-img"
              src="https://i.imgur.com/4QZK5ZM.jpg"
              alt="creator-profile-img"
            />
            <h2 className="creator-profile-title">Creator</h2>
          </div>
          <div className="creator-profile-text-container">
            <div className="creator-profile-text">
              <p className="creator-profile-about-artist">
                I am a creator who loves to create things.
              </p>
            </div>
          </div>
        </div>
        <div className="creator-gallery">
          {posts.map((post) => (
            <MainGalleryPostCard key={post.id} {...post} posts={posts} />
          ))}
        </div>
      </div>
    </>
  );
}
