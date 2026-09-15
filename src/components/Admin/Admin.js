import { useState } from 'react';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { usePosts } from '../../hooks/usePosts.js';
import { useActiveAuctions } from '../../hooks/useActiveAuctions.js';
import PostCard from '../PostCard/PostCard.js';
import './Admin.css';
import Loading from '../Loading/Loading.js';
import Inventory from '../Inventory/Inventory.js';
import { calculateInventoryTotals, formatMoney } from '../Inventory/inventoryTotals.js';
import AuctionResultsPanelSimple from './AuctionResultsPanelSimple.js';
import Sheet from '../Sheet/Sheet.js';
import { useTheme } from '@emotion/react';
import { useMediaQuery } from '@mui/system';

const POSTS_PER_PAGE = 15;

const buildPageWindow = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_unused, index) => index + 1);
  }

  const pages = [1];
  const firstNeighbour = Math.max(2, currentPage - 1);
  const lastNeighbour = Math.min(totalPages - 1, currentPage + 1);

  if (firstNeighbour > 2) pages.push('gap-before');

  for (let page = firstNeighbour; page <= lastNeighbour; page += 1) {
    pages.push(page);
  }

  if (lastNeighbour < totalPages - 1) pages.push('gap-after');

  pages.push(totalPages);
  return pages;
};

export default function Admin() {
  const { posts, loading, setPosts } = usePosts();
  const { auctions, loading: auctionsLoading, error: auctionsError } = useActiveAuctions();
  const [railStartsOpen] = useState(() => window.matchMedia('(min-width: 1200px)').matches);
  const [selectedCategory, setSelectedCategory] = useState(null);
  // Admin filter state for post visibility
  const [showRegular, setShowRegular] = useState(true);
  const [showHidden, setShowHidden] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [auctionSheetOpen, setAuctionSheetOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Picking from the sheet applies the filter and gets out of the way.
  const handleSheetCategorySelect = (category) => {
    handleCategorySelect(category);
    setCategorySheetOpen(false);
  };

  if (loading) {
    return <Loading />;
  }

  const totals = calculateInventoryTotals(posts);

  // Filter posts based on selected category and admin visibility controls
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory && post.category !== selectedCategory) return false;
    if (post.isDeleted) return showDeleted;
    if (post.hide) return showHidden;
    return showRegular;
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const pageIndex = Math.min(currentPage, Math.max(totalPages, 1));
  const indexOfLastPost = pageIndex * POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfLastPost - POSTS_PER_PAGE, indexOfLastPost);

  // Handle page changes
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const activeBidTotal = auctions.reduce(
    (runningTotal, auction) => runningTotal + (auction.currentBid || 0),
    0
  );

  const bidTotalUnknown = auctionsLoading || Boolean(auctionsError);

  // A tile with `onOpen` renders as a button and opens its own detail.
  const statTiles = [
    { label: 'For sale', value: totals.forSaleCount },
    { label: 'Stock value', value: formatMoney(totals.forSaleValue) },
    { label: 'Hidden', value: totals.hiddenCount },
    {
      label: 'Total Bids',
      value: bidTotalUnknown ? '…' : formatMoney(activeBidTotal),
      onOpen: () => setAuctionSheetOpen(true),
    },
  ];

  const visibilityFilters = [
    { label: 'Regular', isOn: showRegular, toggle: () => setShowRegular((isOn) => !isOn) },
    { label: 'Hidden', isOn: showHidden, toggle: () => setShowHidden((isOn) => !isOn) },
    { label: 'Deleted', isOn: showDeleted, toggle: () => setShowDeleted((isOn) => !isOn) },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <p className="admin-dashboard-heading-label">Admin</p>
        <div className="admin-dashboard-title-row">
          <h1 className="admin-dashboard-title">Dashboard</h1>
          <nav className="admin-dashboard-create-links" aria-label="Create">
            <Link className="admin-dashboard-chip admin-dashboard-chip--create" to="/admin/new">
              <AddIcon className="admin-dashboard-chip-icon" />
              <span className="visually-hidden">New </span>post
            </Link>
            <Link
              className="admin-dashboard-chip admin-dashboard-chip--create"
              to="/admin/auctions"
            >
              <AddIcon className="admin-dashboard-chip-icon" />
              <span className="visually-hidden">New </span>auction
            </Link>
          </nav>
        </div>
      </div>

      <div className="admin-dashboard-stats">
        {statTiles.map((tile) => {
          const tileContent = (
            <>
              <span className="admin-dashboard-stat-label">
                {tile.label}
                {tile.onOpen && isMobile && (
                  <span className="admin-dashboard-stat-caret" aria-hidden="true">
                    ›
                  </span>
                )}
              </span>
              <span className="admin-dashboard-stat-value">{tile.value}</span>
            </>
          );

          return tile.onOpen && isMobile ? (
            <button
              key={tile.label}
              type="button"
              className="admin-dashboard-stat admin-dashboard-stat--button"
              onClick={tile.onOpen}
            >
              {tileContent}
            </button>
          ) : (
            <div key={tile.label} className="admin-dashboard-stat">
              {tileContent}
            </div>
          );
        })}
      </div>

      <div className="admin-dashboard-layout">
        <main className="admin-dashboard-posts">
          <div className="admin-dashboard-toolbar">
            <div
              className="admin-dashboard-visibility-filters"
              role="group"
              aria-label="Show posts by visibility"
            >
              {visibilityFilters.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  className={`admin-dashboard-chip${filter.isOn ? ' admin-dashboard-chip--selected' : ''}`}
                  aria-pressed={filter.isOn}
                  onClick={filter.toggle}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="admin-dashboard-chip admin-dashboard-chip--category-picker"
              onClick={() => setCategorySheetOpen(true)}
            >
              Categories
            </button>

            {selectedCategory && (
              <button
                type="button"
                className="admin-dashboard-chip admin-dashboard-chip--clear-category"
                onClick={() => handleCategorySelect(null)}
              >
                {selectedCategory}
                <span aria-hidden="true">✕</span>
                <span className="visually-hidden">, clear category filter</span>
              </button>
            )}

            <p className="admin-dashboard-post-count">
              {filteredPosts.length} of {posts.length}
            </p>
          </div>

          {currentPosts.length === 0 ? (
            <p className="admin-dashboard-empty-message">
              {posts.length === 0
                ? 'No posts yet.'
                : 'No posts match these filters. Turn a filter back on or clear the category.'}
            </p>
          ) : (
            <ul className="admin-dashboard-post-list">
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
            </ul>
          )}

          {totalPages > 1 && (
            <nav className="admin-dashboard-pagination" aria-label="Post list pages">
              <button
                type="button"
                className="admin-dashboard-page-button"
                onClick={() => handlePageChange(pageIndex - 1)}
                disabled={pageIndex === 1}
              >
                Prev
              </button>

              {buildPageWindow(pageIndex, totalPages).map((page) =>
                typeof page === 'string' ? (
                  <span key={page} className="admin-dashboard-page-gap" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    className={`admin-dashboard-page-button${page === pageIndex ? ' admin-dashboard-page-button--current' : ''}`}
                    aria-current={page === pageIndex ? 'page' : undefined}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                className="admin-dashboard-page-button"
                onClick={() => handlePageChange(pageIndex + 1)}
                disabled={pageIndex === totalPages}
              >
                Next
              </button>
            </nav>
          )}
        </main>

        <aside className="admin-dashboard-sidebar">
          <details
            className="admin-dashboard-panel admin-dashboard-panel--auctions"
            open={railStartsOpen}
          >
            <summary className="admin-dashboard-panel-summary">Active auctions</summary>
            <div className="admin-dashboard-panel-content">
              <AuctionResultsPanelSimple auctions={auctions} loading={auctionsLoading} />
            </div>
          </details>

          <details
            className="admin-dashboard-panel admin-dashboard-panel--inventory"
            open={railStartsOpen}
          >
            <summary className="admin-dashboard-panel-summary">Inventory by category</summary>
            <div className="admin-dashboard-panel-content">
              <Inventory
                totals={totals}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </div>
          </details>
        </aside>
      </div>

      <Sheet
        title="Inventory by category"
        isOpen={categorySheetOpen}
        onClose={() => setCategorySheetOpen(false)}
      >
        <Inventory
          totals={totals}
          selectedCategory={selectedCategory}
          onCategorySelect={handleSheetCategorySelect}
        />
      </Sheet>

      <Sheet
        title="Active auctions"
        isOpen={auctionSheetOpen}
        onClose={() => setAuctionSheetOpen(false)}
      >
        <AuctionResultsPanelSimple auctions={auctions} loading={auctionsLoading} />
      </Sheet>
    </div>
  );
}
