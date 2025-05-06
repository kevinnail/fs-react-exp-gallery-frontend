import { useEffect } from 'react';
import { useState } from 'react';
import { fetchGalleryPosts } from '../services/fetch-utils.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function useGalleryPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchGalleryPosts();
        const randomizedData = shuffleArray(data);

        setPosts(randomizedData);
        setLoading(false);
      } catch (e) {
        toast.error(`Error fetching gallery posts: ${e.message}`, {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'useGalleryPosts-1',
        });
        setError(e.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return { posts, setPosts, error, loading, setLoading, setError };
}
