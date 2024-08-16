import { useEffect, useState } from 'react';
import { getPostDetail, getAdditionalImageUrlsPublicIds } from '../services/fetch-utils.js';

export function usePost(id) {
  const [postDetail, setPostDetail] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [additionalImages, setAdditionalImages] = useState([]);

  //
  //
  //
  //
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const data = await getPostDetail(id);
        const additionalImages = await getAdditionalImageUrlsPublicIds(id);
        const additionalImageUrlsPublicIds = additionalImages.map((image) => image.image_url);

        setAdditionalImages(additionalImages);

        setPostDetail(data);
        setImageUrls([...additionalImageUrlsPublicIds]);
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
  };
}
