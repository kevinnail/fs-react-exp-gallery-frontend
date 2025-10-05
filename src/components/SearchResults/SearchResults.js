import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchGalleryPosts } from '../../services/fetch-utils';
import Menu from '../Menu/Menu.js';
import { signOut } from '../../services/auth.js';
import MainGalleryPostCard from '../MainGalleryPostCard/MainGalleryPostCard.js';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext.js';
import { useNavigate } from 'react-router-dom';
const SearchResults = () => {
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const { setUser } = useContext(UserContext);
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

  const handleClick = async () => {
    await signOut();
    setUser(null);
  };

  // Render your search results (e.g., using a list, grid, or other layout)
  return (
    <>
      <div className="menu-search-container">
        <Menu handleClick={handleClick} />
      </div>
      <button
        className="retract-button2 btn-adjust"
        onClick={() => navigate(-1)}
        title="Back to previous page"
      >
        <span className="arrow-icon">←</span>
      </button>
      <div className="gallery-list-container">
        {posts.map((post) => (
          <MainGalleryPostCard key={post.id} {...post} posts={posts} />
        ))}
      </div>
    </>
  );
};

export default SearchResults;
