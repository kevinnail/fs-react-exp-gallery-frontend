import React from 'react';
import './Inventory.css';
import Loading from '../Loading/Loading.js';
import { useGalleryPosts } from '../../hooks/useGalleryPosts.js';
import Menu from '../Menu/Menu.js';
import { useUser } from '../../hooks/useUser.js';
import { signOut } from '../../services/auth.js';
import MainGalleryPostCard from '../MainGalleryPostCard/MainGalleryPostCard.js';

export default function Inventory() {
  const { posts, loading } = useGalleryPosts();
  const { setUser } = useUser();
  console.log('posts', posts);

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
            <h2 className="creator-profile-title">Your file should be downloading</h2>
          </div>
        </div>
      </div>
    </>
  );
}
