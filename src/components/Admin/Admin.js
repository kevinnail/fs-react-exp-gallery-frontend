import { useRef, useState } from 'react';
import { usePosts } from '../../hooks/usePosts.js';
import { useActiveAuctions } from '../../hooks/useActiveAuctions.js';
import PostCard from '../PostCard/PostCard.js';
import './Admin.css';
import Loading from '../Loading/Loading.js';
import Inventory from '../Inventory/Inventory.js';
import { calculateInventoryTotals, formatMoney } from '../Inventory/inventoryTotals.js';
import AuctionResultsPanelSimple from './AuctionResultsPanelSimple.js';

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

  const categorySheet = useRef(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSheetCategorySelect = (category) => {
    handleCategorySelect(category);
    categorySheet.current?.close();
  };

  const handleSheetClick = (event) => {
    if (event.target === categorySheet.current) {
      categorySheet.current.close();
    }
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

  const statTiles = [
    { label: 'For sale', value: totals.forSaleCount },
    { label: 'Stock value', value: formatMoney(totals.forSaleValue) },
    { label: 'Hidden', value: totals.hiddenCount },
    { label: 'Total Bids', value: bidTotalUnknown ? '…' : formatMoney(activeBidTotal) },
  ];

  const visibilityFilters = [
    { label: 'Regular', isOn: showRegular, toggle: () => setShowRegular((isOn) => !isOn) },
    { label: 'Hidden', isOn: showHidden, toggle: () => setShowHidden((isOn) => !isOn) },
    { label: 'Deleted', isOn: showDeleted, toggle: () => setShowDeleted((isOn) => !isOn) },
  ];

  return (
    <div className="slg-admin">
      <div className="slg-admin-head">
        <p className="slg-eyebrow">Admin</p>
        <h1 className="slg-admin-title">Dashboard</h1>
      </div>

      <div className="slg-admin-stats">
        {statTiles.map((tile) => (
          <div key={tile.label} className="slg-stat">
            <span className="slg-stat-label">{tile.label}</span>
            <span className="slg-stat-value">{tile.value}</span>
          </div>
        ))}
      </div>

      <div className="slg-admin-body">
        <main className="slg-admin-main">
          <div className="slg-admin-toolbar">
            <div className="slg-chips" role="group" aria-label="Show posts by visibility">
              {visibilityFilters.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  className={`slg-chip${filter.isOn ? ' slg-chip--on' : ''}`}
                  aria-pressed={filter.isOn}
                  onClick={filter.toggle}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="slg-chip slg-chip--picker"
              onClick={() => categorySheet.current?.showModal()}
            >
              Categories
            </button>

            {selectedCategory && (
              <button
                type="button"
                className="slg-chip slg-chip--clear"
                onClick={() => handleCategorySelect(null)}
              >
                {selectedCategory}
                <span aria-hidden="true">✕</span>
                <span className="slg-visually-hidden">, clear category filter</span>
              </button>
            )}

            <p className="slg-admin-count">
              {filteredPosts.length} of {posts.length}
            </p>
          </div>

          {currentPosts.length === 0 ? (
            <p className="slg-admin-empty">
              {posts.length === 0
                ? 'No posts yet.'
                : 'No posts match these filters. Turn a filter back on or clear the category.'}
            </p>
          ) : (
            <ul className="slg-admin-list">
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
            <nav className="slg-pager" aria-label="Post list pages">
              <button
                type="button"
                className="slg-pager-button"
                onClick={() => handlePageChange(pageIndex - 1)}
                disabled={pageIndex === 1}
              >
                Prev
              </button>

              {buildPageWindow(pageIndex, totalPages).map((page) =>
                typeof page === 'string' ? (
                  <span key={page} className="slg-pager-gap" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    className={`slg-pager-button${page === pageIndex ? ' slg-pager-button--on' : ''}`}
                    aria-current={page === pageIndex ? 'page' : undefined}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                className="slg-pager-button"
                onClick={() => handlePageChange(pageIndex + 1)}
                disabled={pageIndex === totalPages}
              >
                Next
              </button>
            </nav>
          )}
        </main>

        <aside className="slg-admin-rail">
          <details className="slg-panel" open={railStartsOpen}>
            <summary className="slg-panel-summary">Active auctions</summary>
            <div className="slg-panel-body">
              <AuctionResultsPanelSimple auctions={auctions} loading={auctionsLoading} />
            </div>
          </details>

          <details className="slg-panel slg-panel--inventory" open={railStartsOpen}>
            <summary className="slg-panel-summary">Inventory by category</summary>
            <div className="slg-panel-body">
              <Inventory
                totals={totals}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </div>
          </details>
        </aside>
      </div>

      <dialog ref={categorySheet} className="slg-sheet" onClick={handleSheetClick}>
        <div className="slg-sheet-head">
          <h2 className="slg-sheet-title">Inventory by category</h2>
          <button
            type="button"
            className="slg-sheet-close"
            onClick={() => categorySheet.current?.close()}
          >
            Done
          </button>
        </div>

        <div className="slg-sheet-body">
          <Inventory
            totals={totals}
            selectedCategory={selectedCategory}
            onCategorySelect={handleSheetCategorySelect}
          />
        </div>
      </dialog>
    </div>
  );
}
