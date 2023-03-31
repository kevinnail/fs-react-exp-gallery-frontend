import { useEffect, useState } from 'react';
import { getPostDetail, getAdditionalImageUrls } from '../services/fetch-utils.js';

export function usePost(id) {
  const [postDetail, setPostDetail] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [additionalImages, setAdditionalImages] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const data = await getPostDetail(id);
        // const additionalImages = await getAdditionalImageUrls(id);
        const additionalImages = await getAdditionalImageUrls(id);
        const additionalImageUrls = additionalImages.map((image) => image.image_url);

        setAdditionalImages(additionalImages);
        console.log('additionalImages: ', additionalImages);

        setPostDetail(data);
        // setImageUrls([data.image_url, ...additionalImageUrls]);
        setImageUrls([...additionalImageUrls]);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
    additionalImages,
    setAdditionalImages,
    // additionalImageUrls: imageUrls, // .slice(1 /* skip the first image */),
  };
}
