import { useEffect } from 'react';
import { useState } from 'react';
import { fetchGalleryPosts } from '../services/fetch-utils.js';

export function useGalleryPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchGalleryPosts();

        setPosts(data);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return { posts, setPosts, error, loading, setLoading, setError };
}
