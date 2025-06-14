import { useState } from 'react';
import { useEffect } from 'react';
import { fetchPosts } from '../services/fetch-utils.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPosts();
        setPosts(data);
        setLoading(false);
      } catch (e) {
        if (e.response && e.response.status === 401) {
          console.error(e.response.data.message);
        }
        setError(e.message);
        toast.error(`Error fetching posts: ${e.message}`, {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'usePosts-1',
          autoClose: false,
        });
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return { posts, setPosts, error, loading, setLoading, setError };
}
