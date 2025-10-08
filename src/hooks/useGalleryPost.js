import { useEffect } from 'react';
import { useState } from 'react';
import {
  getAdditionalImageUrlsPublicIdsGallery,
  getGalleryPostDetail,
} from '../services/fetch-utils.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function useGalleryPost(id) {
  const [postDetail, setPostDetail] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [additionalImagesGallery, setAdditionalImagesGallery] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const data = await getGalleryPostDetail(id);
        if (!data) {
          history.push('/');
        }
        const additionalImagesGallery = await getAdditionalImageUrlsPublicIdsGallery(id);
        const additionalImageUrlsPublicIds = additionalImagesGallery.map(
          (image) => image.image_url
        );

        setAdditionalImagesGallery(additionalImagesGallery);

        setPostDetail(data);
        setImageUrls([...additionalImageUrlsPublicIds]);
        setLoading(false);
      } catch (e) {
        toast.error(`Error fetching gallery post: ${e.message}`, {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'useGalleryPost-1',
          onClose: () => navigate('/'),
        });
        setError(e.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  return {
    postDetail,
    setPostDetail,
    imageUrls,
    setImageUrls,
    loading,
    setLoading,
    error,
    setError,
    isDeleted,
    setIsDeleted,
    additionalImagesGallery,
    setAdditionalImagesGallery,
  };
}
