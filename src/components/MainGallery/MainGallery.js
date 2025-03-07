import React, { useState, useEffect } from 'react';
import { useGalleryPosts } from '../../hooks/useGalleryPosts.js';
import MainGalleryPostCard from '../MainGalleryPostCard/MainGalleryPostCard.js';
import '../Gallery/Gallery.css';
import Menu from '../Menu/Menu.js';
import { signOut } from '../../services/auth.js';
import { useUser } from '../../hooks/useUser.js';
import Loading from '../Loading/Loading.js';
import { getSiteMessage } from '../../services/fetch-utils.js';
import { Box } from '@mui/material';

//
//
//
export default function MainGallery() {
  const { posts, loading } = useGalleryPosts();
  const { setUser } = useUser();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const currentMessage = await getSiteMessage();
        setMessage(currentMessage.message);
      } catch (error) {
        console.error('An error occurred while fetching the message:', error);
      }
    };

    fetchMessage();
  }, []);
  if (loading) {
    return <Loading />;
  }

  const handleClick = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <>
      <Box className="menu-search-container">
        <Menu handleClick={handleClick} />
      </Box>
      <Box className="up-top-msg" sx={{ width: '100%' }}>
        <span className="site-msg-span">{message}</span>
        <Box className="contact-wrapper">
          {' '}
          <span className="site-message-contact-header">Contact</span>
          <Box className="message-link-wrapper">
            <a href={'mailto:kevin@kevinnail.com'}>
              <img className="site-msg-link-ig" width={'48px'} src="/email.png" />
            </a>
            <a href="https://www.instagram.com/stresslessglass">
              <img width={'48px'} src="/IG.png" />
            </a>
          </Box>
        </Box>
      </Box>
      <Box className="gallery-list-container">
        {posts.map((post) => (
          <MainGalleryPostCard key={post.id} {...post} />
        ))}
      </Box>
    </>
  );
}
