import { useEffect } from 'react';
import { useState } from 'react';
import {
  getAdditionalImageUrlsPublicIdsGallery,
  getGalleryPostDetail,
} from '../services/fetch-utils.js';

export function useGalleryPost(id) {
  const [postDetail, setPostDetail] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [additionalImagesGallery, setAdditionalImagesGallery] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const data = await getGalleryPostDetail(id);
        const additionalImagesGallery = await getAdditionalImageUrlsPublicIdsGallery(id);
        const additionalImageUrlsPublicIds = additionalImagesGallery.map(
          (image) => image.image_url
        );
        const transformedUrls = additionalImageUrlsPublicIds.map((url) => {
          if (url.endsWith('.mov') || url.endsWith('.mp4')) {
            const [version, folder, filename] = url.split('/').slice(-3);
            const transformedUrl = `https://res.cloudinary.com/dxmizigwh/video/upload/f_auto/${version}/${folder}/${filename}`;
            // const transformedUrl = url.replace('.mov', '.webm').replace('.mp4', '.webm');
            return transformedUrl;
          }
          return url;
        });

        // console.log('transformedUrls', transformedUrls);

        setAdditionalImagesGallery(additionalImagesGallery);

        setPostDetail(data);
        // setImageUrls([...additionalImageUrlsPublicIds]);
        setImageUrls([...transformedUrls]);
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
    additionalImagesGallery,
    setAdditionalImagesGallery,
  };
}
