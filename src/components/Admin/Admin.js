import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts.js';
import { useUser } from '../../hooks/useUser.js';
import PostCard from '../PostCard/PostCard.js';
import './Admin.css';
import { signOut } from '../../services/auth.js';
import Menu from '../Menu/Menu.js';
import Loading from '../Loading/Loading.js';
import Inventory from '../Inventory/Inventory.js';

export default function Admin() {
  const { user, setUser } = useUser();
  const { posts, loading, setPosts, error } = usePosts();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  const handleClick = async () => {
    await signOut();
    setUser(null);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="loading-div-wrapper">
        <h2 className="error-state">
          Something went wrong. Please refresh the page or try again later. Here{"'"}s the error
          message if it helps:
          <br />
          <span className="error-span">{error}</span>
        </h2>
      </div>
    );
  }

  // Filter posts based on selected category
  const filteredPosts = posts.filter(
    (post) => !selectedCategory || post.category === selectedCategory
  );

  // Calculate pagination values
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Handle page changes
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Create pagination controls
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination-controls">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`pagination-button ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    );
  };

  //! fucking around with webhooks
  // const handleFetch = async () => {
  //   try {
  //     const response = await fetch('https://www.atthefire.com/api/v1/stuff', {
  //       method: 'POST',
  //       // headers: { 'Content-Type': 'application/json' },
  //       // body: JSON.stringify({}), // Include an empty body if your backend expects it
  //     });
  //     const data = await response.json();
  //     console.log(data);
  //   } catch (error) {
  //     console.error('Error fetching:', error);
  //   }
  // };

  return (
    <>
      <div className="admin-container">
        {/* <button onClick={handleFetch}>Fetch Data</button> */}
        <aside className="admin-panel">
          <section className="admin-panel-section">
            <div>
              <Menu handleClick={handleClick} />
            </div>
          </section>
        </aside>
        <div className="list-container">
          {posts.length === 0 ? (
            <div className="loading">
              <h1>No posts yet!</h1>
            </div>
          ) : (
            <>
              {currentPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  post={post}
                  setPosts={setPosts}
                  posts={posts}
                />
              ))}
              <PaginationControls />
            </>
          )}
        </div>
        <Inventory
          posts={posts}
          onCategorySelect={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
      </div>
    </>
  );
}
