import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchGalleryPosts } from '../../services/fetch-utils.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import './SearchBar.css';

const MINIMUM_TERM_LENGTH = 2;

// Video posts store a matching .jpg poster frame alongside the .mp4.
const posterFrameFor = (source) =>
  source.endsWith('.mp4') ? `${source.slice(0, -4)}.jpg` : source;

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedTerm = useDebouncedValue(searchTerm.trim(), 300);
  const navigate = useNavigate();
  const location = useLocation();

  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const inputRef = useRef(null);
  // Guards against an earlier, slower request overwriting a newer one.
  const latestRequestRef = useRef(0);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
    setResults([]);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // A navigation means the search did its job, or the user left.
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (panelRef.current?.contains(event.target) || toggleRef.current?.contains(event.target)) {
        return;
      }
      close();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;

    if (debouncedTerm.length < MINIMUM_TERM_LENGTH) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setIsSearching(true);

    searchGalleryPosts(debouncedTerm)
      .then((matches) => {
        if (latestRequestRef.current !== requestId) return;
        setResults(Array.isArray(matches) ? matches : []);
        setIsSearching(false);
      })
      .catch(() => {
        if (latestRequestRef.current !== requestId) return;
        setResults([]);
        setIsSearching(false);
      });
  }, [debouncedTerm, isOpen]);

  const hasTerm = debouncedTerm.length >= MINIMUM_TERM_LENGTH;

  return (
    <div className="slg-search">
      <button
        type="button"
        ref={toggleRef}
        className="slg-search-toggle"
        aria-label={isOpen ? 'Close search' : 'Search pieces'}
        aria-expanded={isOpen}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L21 21" />
          </svg>
        )}
      </button>

      {isOpen ? (
        <div className="slg-search-panel" ref={panelRef}>
          <form
            className="slg-search-form"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <svg className="slg-search-form-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5L21 21" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              className="slg-search-input"
              placeholder="Search pieces, colors, categories…"
              aria-label="Search pieces"
              autoComplete="off"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {hasTerm && !isSearching ? (
              <span className="slg-search-count">
                {results.length} {results.length === 1 ? 'piece' : 'pieces'}
              </span>
            ) : null}
          </form>

          {hasTerm ? (
            <div className="slg-search-results">
              {isSearching && !results.length ? (
                <p className="slg-search-status">Searching…</p>
              ) : null}

              {!isSearching && !results.length ? (
                <p className="slg-search-status">
                  No pieces match “{debouncedTerm}”. Try a color, a shape, or a category.
                </p>
              ) : null}

              {results.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  className="slg-search-hit"
                  onClick={() => navigate(`/${post.id}`)}
                >
                  <span className="slg-search-hit-frame">
                    {post.image_url ? (
                      <img src={posterFrameFor(post.image_url)} alt="" loading="lazy" />
                    ) : null}
                  </span>
                  <span className="slg-search-hit-text">
                    <span className="slg-search-hit-name">{post.title}</span>
                    <span className="slg-search-hit-meta">
                      {post.sold ? 'Sold' : `$${post.price}`}
                      {post.category ? ` · ${post.category}` : ''}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SearchBar;
