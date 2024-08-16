import { useEffect } from 'react';
import { useState } from 'react';
import { fetchGalleryPosts } from '../services/fetch-utils.js';

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

  // Assuming your fetch result is stored in a variable called 'data'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchGalleryPosts();
        const randomizedData = shuffleArray(data);

        setPosts(randomizedData);
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
