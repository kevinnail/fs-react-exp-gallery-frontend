import { useEffect, useState } from 'react';
import { getPostDetail } from '../services/fetch-utils.js';

export function usePost(id) {
  const [postDetail, setPostDetail] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        console.log('id', id); // working
        const data = await getPostDetail(id);
        console.log('data', data); // 403 error

        setPostDetail(data);
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
    loading,
    setLoading,
    error,
    setError,
    isDeleted,
    setIsDeleted,
  };
}
