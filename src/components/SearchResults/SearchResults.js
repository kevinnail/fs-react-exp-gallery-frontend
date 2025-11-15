import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchGalleryPosts } from '../../services/fetch-utils.js';
import MainGalleryPostCard from '../MainGalleryPostCard/MainGalleryPostCard.js';
import { useNavigate } from 'react-router-dom';
const SearchResults = () => {
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('q');

    const fetchSearchResults = async () => {
      const results = await searchGalleryPosts(searchTerm);
      setPosts(results);
    };

    fetchSearchResults();
  }, [location]);

  // Render your search results (e.g., using a list, grid, or other layout)
  return (
    <div style={{ marginTop: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: '.5rem',
            justifySelf: 'start',
          }}
        >
          ← Back
        </button>
      </div>
      <div className="gallery-list-container">
        {posts.map((post) => (
          <MainGalleryPostCard key={post.id} {...post} posts={posts} />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
