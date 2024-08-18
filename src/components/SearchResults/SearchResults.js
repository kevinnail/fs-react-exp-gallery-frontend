import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchGalleryPosts } from '../../services/fetch-utils';
import Menu from '../Menu/Menu.js';
import { signOut } from '../../services/auth.js';
import MainGalleryPostCard from '../MainGalleryPostCard/MainGalleryPostCard.js';
import { useUser } from '../../hooks/useUser.js';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min.js';
const SearchResults = () => {
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const { setUser } = useUser();
  const history = useHistory();
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
        onClick={() => (history.length > 0 ? history.goBack() : history.push('/main-gallery'))}
        title="Back to previous page"
      >
        <i className="fa fa-arrow-left" aria-hidden="true"></i>
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
