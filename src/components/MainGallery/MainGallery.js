import { useState, useEffect } from 'react';
import { useGalleryPosts } from '../../hooks/useGalleryPosts.js';
import MainGalleryPostCard from '../MainGalleryPostCard/MainGalleryPostCard.js';
import '../Gallery/Gallery.css';
import Loading from '../Loading/Loading.js';
import { getSiteMessage } from '../../services/fetch-utils.js';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuctionCarousel from './AuctionCarousel.js';
import { useNavigate } from 'react-router-dom';

//
//
//
export default function MainGallery() {
  const { posts, galleryLoading } = useGalleryPosts();
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const currentMessage = await getSiteMessage();
        setMessage(currentMessage.message);
      } catch (e) {
        console.error('An error occurred while fetching the customer message:', e);
        toast.error(`An error occurred while fetching the customer message: ${e.message}`, {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'edit-post-1',
          autoClose: false,
        });
      }
    };

    fetchMessage();
  }, []);

  return galleryLoading ? (
    <Loading />
  ) : (
    <>
      <Box className="up-top-msg" sx={{ width: '100%' }}>
        <span className="site-msg-span">{message}</span>

        <AuctionCarousel />
      </Box>
      <Box className="gallery-list-container">
        {posts.map((post) => (
          <MainGalleryPostCard key={post.id} {...post} />
        ))}
      </Box>
    </>
  );
}
