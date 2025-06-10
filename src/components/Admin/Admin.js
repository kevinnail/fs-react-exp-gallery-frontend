import { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts.js';
import { useUser } from '../../hooks/useUser.js';
import PostCard from '../PostCard/PostCard.js';
import './Admin.css';
import { signOut } from '../../services/auth.js';
import Menu from '../Menu/Menu.js';
import Loading from '../Loading/Loading.js';
import Inventory from '../Inventory/Inventory.js';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function Admin() {
  const { user, setUser } = useUser();
  const { posts, loading, setPosts, error } = usePosts();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.down('lg'));

  const postsPerPage = isMobile ? 9 : 7;
  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

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
    if (i < 5 && isMobile) {
      pageNumbers.push(i);
    } else if (!isMobile) {
      pageNumbers.push(i);
    }
  }

  // Create pagination controls
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    // Logic for which page numbers to display
    let displayedPageNumbers = [];

    if (isMobile) {
      // For mobile: Show fewer buttons (maximum of 3) to prevent overflow
      if (totalPages <= 3) {
        // If 3 or fewer pages, show all
        for (let i = 1; i <= totalPages; i++) {
          displayedPageNumbers.push(i);
        }
      } else {
        // Always include first page
        displayedPageNumbers.push(1);

        // Add ellipsis if current page is not near the beginning
        if (currentPage > 2) {
          displayedPageNumbers.push('...');
        }

        // Add current page if not first or last
        if (currentPage !== 1 && currentPage !== totalPages) {
          displayedPageNumbers.push(currentPage);
        }

        // Add ellipsis if current page is not near the end
        if (currentPage < totalPages - 1) {
          displayedPageNumbers.push('...');
        }

        // Always include last page
        displayedPageNumbers.push(totalPages);
      }
    } else {
      // For desktop: show all pages
      for (let i = 1; i <= totalPages; i++) {
        displayedPageNumbers.push(i);
      }
    }

    return (
      <div className="pagination-controls">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>

        {displayedPageNumbers.map((item, index) => {
          if (item === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-button ellipsis">
                ...
              </span>
            );
          }

          return (
            <button
              key={item}
              onClick={() => handlePageChange(item)}
              className={`pagination-button ${currentPage === item ? 'active' : ''}`}
            >
              {item}
            </button>
          );
        })}

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

  return (
    <>
      <div className="admin-container">
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
                  originalPrice={post.originalPrice}
                  discountedPrice={post.discountedPrice}
                />
              ))}
              <PaginationControls />
            </>
          )}
        </div>

        <Box
          sx={{
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
          className="large-size-inventory"
        >
          <Accordion
            defaultExpanded={isDesktop ? false : true}
            sx={{ backgroundColor: 'rgb(40, 40, 40)', border: 'none' }}
          >
            {(isMobile || isDesktop) && (
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Inventory/ Category Selector
              </AccordionSummary>
            )}
            <AccordionDetails sx={{ padding: '0', backgroundColor: 'black' }}>
              <Button
                style={{ marginTop: '0px' }}
                disabled={!selectedCategory}
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentPage(1);
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: '#2f44ff',
                    textShadow: '0 0 1px black',
                  }}
                >
                  {selectedCategory ? 'Show All Categories' : 'Select Category'}
                </Typography>
              </Button>

              <Inventory
                posts={posts}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      </div>
    </>
  );
}
