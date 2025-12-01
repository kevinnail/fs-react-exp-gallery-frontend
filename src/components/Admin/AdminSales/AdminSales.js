import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AdminSales.css';
import {
  getAllSales,
  createSale,
  updateSaleTracking,
  updateSalePaidStatus,
} from '../../../services/fetch-sales.js';
import { getAllUsers } from '../../../services/fetch-utils.js';
import { usePosts } from '../../../hooks/usePosts.js';

export default function AdminSales() {
  const location = useLocation();
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingSale, setIsCreatingSale] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserResults, setShowUserResults] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const { posts } = usePosts();

  // Modal state for finding post
  const [showPostModal, setShowPostModal] = useState(false);

  // state for creating a sale
  const [newBuyerEmail, setNewBuyerEmail] = useState('');
  const [newPieceId, setNewPieceId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newTracking, setNewTracking] = useState('');
  // Helper for selecting a post from modal
  const getPostPrice = (post) => {
    if (
      post.discountedPrice !== null &&
      post.discountedPrice !== undefined &&
      !Number.isNaN(post.discountedPrice)
    ) {
      return post.discountedPrice;
    }
    return post.price;
  };

  const handleSelectPost = (post) => {
    setNewPieceId(post.id);
    setNewPrice(String(getPostPrice(post)));
    setShowPostModal(false);
  };

  // state for editing tracking on existing sale
  const [trackingInput, setTrackingInput] = useState('');

  const loadSales = async () => {
    try {
      setLoading(true);

      const salesData = await getAllSales();
      const users = await getAllUsers();
      setUsers(Array.isArray(users) ? users : []);
      setSales(salesData);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  // handle selecting an existing sale
  const handleSelectSale = (saleId) => {
    setIsCreatingSale(false);
    setSelectedSale(saleId);

    const sale = sales.find((s) => s.id === saleId);
    if (sale) {
      setTrackingInput(sale.tracking_number || '');
    }
  };

  // handle saving tracking number
  const handleSaveTracking = async () => {
    try {
      await updateSaleTracking(selectedSale, trackingInput);
      await loadSales();
    } catch (e) {
      toast.error(`${e.message}` || 'Error updating tracking number', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'admin-sales-tracking-1',
        autoClose: 3000,
      });
    }
  };

  // handle creating a new sale
  const handleCreateSale = async () => {
    try {
      await createSale(newBuyerEmail, newPieceId, newPrice, newTracking);

      // reset inputs
      setNewBuyerEmail('');
      setNewPieceId('');
      setNewPrice('');
      setNewTracking('');

      setIsCreatingSale(false);
      await loadSales();
    } catch (e) {
      toast.error(`${e.message}` || 'Error creating sale', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'admin-sales-create-1',
        autoClose: 3000,
      });
    }
  };

  const handleTrackingClick = (trackingNumber) => {
    if (!trackingNumber) return;
    const url = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`;
    window.open(url, '_blank');
  };

  // Copy helper for currently selected sale's buyer address
  const handleCopyCurrentSaleAddress = () => {
    if (!currentSale) return;
    // try to resolve buyer user from loaded users by email
    const buyerEmail = (currentSale.buyer_email || '').toLowerCase();
    const buyerUser = users.find(
      (u) => (u.email || u.user_email || '').toLowerCase() === buyerEmail
    );

    const profile = buyerUser?.profile || {};
    const address = buyerUser?.address;

    if (!address) {
      toast.error('No address on file to copy.', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'admin-sales-current-copy-no-address',
        autoClose: 3500,
      });
      return;
    }

    const name = [
      profile.firstName || currentSale.buyer_first_name,
      profile.lastName || currentSale.buyer_last_name,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    const countryCode = (address.countryCode || 'US').toUpperCase();
    const lines = [
      name,
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      countryCode !== 'US' ? countryCode : null,
    ].filter(Boolean);
    const text = lines.join('\n');

    const onSuccess = () => {
      toast.success('Address copied', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        toastId: 'admin-sales-current-address-copied',
        autoClose: 2000,
      });
    };

    const onFail = () => {
      toast.error('Failed to copy address', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'admin-sales-current-address-copy-fail',
        autoClose: 3000,
      });
    };

    if (
      typeof window !== 'undefined' &&
      window.navigator &&
      window.navigator.clipboard &&
      window.navigator.clipboard.writeText
    ) {
      window.navigator.clipboard.writeText(text).then(onSuccess).catch(onFail);
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.readOnly = true;
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        // Clipboard API not available; instruct manual copy
        toast.info('Clipboard not available. Press Ctrl+C to copy.', {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'admin-sales-address-copy-manual',
          autoClose: 3500,
        });
        // Clean up the temporary element
        setTimeout(() => {
          document.body.removeChild(ta);
        }, 4000);
      } catch (e) {
        onFail();
      }
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  // Debounce the search input by 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Filter users by email or name
  const filteredUsers = useMemo(() => {
    if (!debouncedTerm) return [];
    const term = debouncedTerm.toLowerCase();
    return users
      .filter((u) => {
        const email = (u.email || u.user_email || '').toLowerCase();
        const firstName = (u.profile?.firstName || u.first_name || '').toLowerCase();
        const lastName = (u.profile?.lastName || u.last_name || '').toLowerCase();
        const name = `${firstName} ${lastName}`.trim();
        return email.includes(term) || name.includes(term);
      })
      .slice(0, 10);
  }, [users, debouncedTerm]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setNewBuyerEmail(user.email || user.user_email || '');
    setShowUserResults(false);
    if (!user.address) {
      toast.error('This user does not have a shipping address on file.', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'admin-sales-user-no-address',
        autoClose: 4000,
      });
    }
  };

  const handleCopyAddress = () => {
    if (!selectedUser) return;
    const profile = selectedUser.profile || {};
    const address = selectedUser.address;
    if (!address) {
      toast.error('No address on file to copy.', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'admin-sales-copy-no-address',
        autoClose: 3500,
      });
      return;
    }
    const name =
      [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() ||
      selectedUser.email ||
      '';
    const countryCode = (address.countryCode || 'US').toUpperCase();
    const lines = [
      name,
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      countryCode !== 'US' ? countryCode : null,
    ].filter(Boolean);
    const text = lines.join('\n');

    const onSuccess = () => {
      toast.success('Address copied', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        toastId: 'admin-sales-address-copied',
        autoClose: 2000,
      });
    };

    const onFail = () => {
      toast.error('Failed to copy address', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'admin-sales-address-copy-fail',
        autoClose: 3000,
      });
    };

    if (
      typeof window !== 'undefined' &&
      window.navigator &&
      window.navigator.clipboard &&
      window.navigator.clipboard.writeText
    ) {
      window.navigator.clipboard.writeText(text).then(onSuccess).catch(onFail);
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.readOnly = true;
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        toast.info('Clipboard not available. Press Ctrl+C to copy.', {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'admin-sales-current-address-copy-manual',
          autoClose: 3500,
        });
        setTimeout(() => {
          document.body.removeChild(ta);
        }, 4000);
      } catch (e) {
        onFail();
      }
    }
  };
  const handleSearchByEmail = () => {
    if (!newBuyerEmail) return;
    const emailLower = newBuyerEmail.toLowerCase();
    setSearchTerm(newBuyerEmail);
    setShowUserResults(true);
    // attempt immediate auto-select for exact match
    const match = users.find((u) => {
      const userEmail = (u.email || u.user_email || '').toLowerCase();
      return userEmail === emailLower;
    });
    if (match) {
      handleSelectUser(match);
    }
  };

  // the one new refactor line
  const currentSale = selectedSale ? sales.find((s) => s.id === selectedSale) : null;

  // Prefill from AdminInbox navigation
  useEffect(() => {
    const prefill = location.state?.prefill;
    if (!prefill || prefillApplied) return;

    // Open create sale form
    setIsCreatingSale(true);

    // Prefill fields
    if (prefill.buyerEmail) setNewBuyerEmail(prefill.buyerEmail);
    if (prefill.piece?.id) setNewPieceId(prefill.piece.id);
    if (prefill.piece) {
      const hasDiscount =
        prefill.piece.discountedPrice !== null &&
        prefill.piece.discountedPrice !== undefined &&
        !Number.isNaN(prefill.piece.discountedPrice);
      const priceToUse = hasDiscount ? prefill.piece.discountedPrice : prefill.piece.price;
      if (priceToUse !== null && priceToUse !== undefined) setNewPrice(String(priceToUse));
    }

    // Try selecting the user from loaded users by id or email
    if (users && users.length > 0 && (prefill.user?.id || prefill.user?.email)) {
      const match = users.find(
        (u) =>
          (prefill.user?.id && Number(u.id) === Number(prefill.user.id)) ||
          (prefill.user?.email &&
            ((u.email && u.email.toLowerCase() === prefill.user.email.toLowerCase()) ||
              (u.user_email && u.user_email.toLowerCase() === prefill.user.email.toLowerCase())))
      );
      if (match) {
        setSelectedUser(match);
      }
    }

    setPrefillApplied(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, users, prefillApplied]);

  // Helper function to determine border color based on payment and shipping status
  const getSaleBorderColor = (sale) => {
    // Not paid and no tracking = red
    if (!sale.is_paid && (!sale.tracking_number || sale.tracking_number === '0')) {
      return 'red';
    }
    // Paid but no tracking = yellow
    if (sale.is_paid && (!sale.tracking_number || sale.tracking_number === '0')) {
      return 'yellow';
    }
    // Paid and has tracking = green
    if (sale.is_paid && sale.tracking_number && sale.tracking_number !== '0') {
      return 'green';
    }
    // Default fallback
    return '#333';
  };

  return (
    <div className="admin-sales-wrapper">
      <div className="admin-sales-container">
        <div className="admin-sales-content">
          <div className="sales-header">
            <h1>Gallery Sales</h1>

            <button
              className="add-sale-button"
              onClick={() => {
                setSelectedSale(null);
                setIsCreatingSale(true);
                setSelectedUser(null);
                setSearchTerm('');
                setDebouncedTerm('');
              }}
            >
              Add Sale
            </button>
          </div>

          <div className="sales-layout">
            {/* Sales list */}
            <div className="sales-list">
              {loading ? (
                <div className="loading-sales">
                  <p>Loading sales...</p>
                </div>
              ) : sales.length === 0 ? (
                <div className="no-sales">
                  <p>No sales yet</p>
                </div>
              ) : (
                <div className="sales-items">
                  {sales.map((sale) => (
                    <div
                      key={sale.id}
                      className={`sales-item ${selectedSale === sale.id ? 'selected' : ''}`}
                      onClick={() => handleSelectSale(sale.id)}
                      style={{ border: `2px solid ${getSaleBorderColor(sale)}` }}
                    >
                      <div className="sales-item-img-wrapper">
                        <img
                          src={sale.image_url}
                          alt={sale.post_title}
                          className="sales-item-img"
                        />
                      </div>

                      <div className="sales-item-info">
                        <span className="sales-post-title">{sale.post_title}</span>

                        <div className="sales-item-meta">
                          <span>${sale.price}</span>
                          <span>{sale.buyer_email}</span>
                        </div>

                        <div className="sales-item-meta">
                          <span>
                            <strong>{sale.buyer_first_name}</strong>{' '}
                            {sale.buyer_last_name?.length > 30
                              ? sale.buyer_last_name?.slice(0, 4) + '...'
                              : sale.buyer_last_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sale detail panel */}
            <div className="sales-panel">
              {isCreatingSale ? (
                <div className="sales-detail">
                  <h2>Create New Sale</h2>

                  {/* Customer search */}
                  <div className="sales-detail-row" style={{ alignItems: 'flex-start' }}>
                    <label>Find Customer:</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="tracking-input"
                        placeholder="Type name or email..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowUserResults(true);
                        }}
                        onFocus={() => setShowUserResults(true)}
                      />
                      {showUserResults && debouncedTerm && (
                        <div className="user-search-results" role="listbox">
                          {filteredUsers.length === 0 ? (
                            <div className="user-result-item empty">No users found</div>
                          ) : (
                            filteredUsers.map((u) => (
                              <div
                                key={u.id}
                                className="user-result-item"
                                role="option"
                                onClick={() => handleSelectUser(u)}
                              >
                                {u.profile?.imageUrl || u.profile?.image_url ? (
                                  <img
                                    src={u.profile.imageUrl || u.profile.image_url}
                                    alt="avatar"
                                    className="user-avatar"
                                  />
                                ) : (
                                  <div className="user-avatar-fallback">
                                    {(u.profile?.firstName || u.email || u.user_email || '?')
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                                <div className="user-meta">
                                  <div className="user-name">
                                    {(u.profile?.firstName || 'Unknown') +
                                      ' ' +
                                      (u.profile?.lastName || '')}
                                  </div>
                                  <div className="user-email">{u.email || u.user_email}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected customer summary */}
                  {selectedUser && (
                    <div className="selected-user-card">
                      <div className="selected-user-header">
                        {selectedUser.profile?.imageUrl || selectedUser.profile?.image_url ? (
                          <img
                            src={selectedUser.profile.imageUrl || selectedUser.profile.image_url}
                            alt="avatar"
                            className="user-avatar"
                          />
                        ) : (
                          <div className="user-avatar-fallback">
                            {(selectedUser.profile?.firstName || selectedUser.email || '?')
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="user-meta">
                          <div className="user-name">
                            {(selectedUser.profile?.firstName || 'Unknown') +
                              ' ' +
                              (selectedUser.profile?.lastName || '')}
                          </div>
                          <div className="user-email">{selectedUser.email}</div>
                        </div>
                      </div>
                      <div className="selected-user-address">
                        <div className="selected-user-address-actions">
                          <button
                            type="button"
                            className="copy-address-button"
                            onClick={handleCopyAddress}
                            disabled={!selectedUser.address}
                          >
                            Copy
                          </button>
                        </div>
                        {selectedUser.address ? (
                          <div className="address-lines">
                            <div>{selectedUser.address.addressLine1}</div>
                            {selectedUser.address.addressLine2 ? (
                              <div>{selectedUser.address.addressLine2}</div>
                            ) : null}
                            <div>
                              {selectedUser.address.city}, {selectedUser.address.state}{' '}
                              {selectedUser.address.postalCode}
                            </div>
                            <div>{selectedUser.address.countryCode || 'US'}</div>
                          </div>
                        ) : (
                          <div className="address-missing">No shipping address on file</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="sales-detail-row">
                    <label>Buyer Email:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <input
                        type="text"
                        className="tracking-input"
                        value={newBuyerEmail}
                        onChange={(e) => setNewBuyerEmail(e.target.value)}
                      />

                      <button
                        type="button"
                        onClick={handleSearchByEmail}
                        className="search-email-button"
                        aria-label="Use email to find user"
                      >
                        Find User
                      </button>
                    </div>
                  </div>

                  <div className="sales-detail-row">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      Piece ID:
                    </label>
                    <input
                      type="number"
                      className="tracking-input"
                      value={newPieceId}
                      onChange={(e) => setNewPieceId(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPostModal(true)}
                      className="search-post-button"
                      aria-label="Click to find post"
                    >
                      Find Post
                    </button>
                  </div>
                  {/* Post Finder Modal */}
                  {showPostModal && (
                    <div
                      className="find-post-modal"
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.45)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          background: '#1a1a1aff',
                          borderRadius: '8px',
                          padding: '2rem',
                          maxHeight: '80vh',
                          overflowY: 'auto',
                          minWidth: '320px',
                          maxWidth: '95vw',
                          boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
                          position: 'relative',
                        }}
                      >
                        <button
                          style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            fontSize: '1.2em',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => setShowPostModal(false)}
                          aria-label="Close post finder"
                        >
                          ×
                        </button>
                        <h3 style={{ marginTop: 0 }}>Select a Post</h3>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: '1rem',
                            marginTop: '1rem',
                          }}
                        >
                          {(() => {
                            if (posts && posts.length > 0) {
                              return posts.map((post) => {
                                const price = getPostPrice(post);
                                let imageSrc = '';
                                if (post.image_url) {
                                  imageSrc = post.image_url;
                                } else if (post.imageUrl) {
                                  imageSrc = post.imageUrl;
                                }
                                return (
                                  <div
                                    key={post.id}
                                    className="find-post-card"
                                    style={{
                                      border: '1px solid #ccc',
                                      borderRadius: '6px',
                                      padding: '0.5rem ',
                                      cursor: 'pointer',
                                      background: '#0f0f0fff',
                                      display: 'flex',
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      transition: 'box-shadow 0.2s',
                                      maxWidth: '300px',
                                    }}
                                    onClick={() => handleSelectPost(post)}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSelectPost(post);
                                    }}
                                  >
                                    <img
                                      src={imageSrc}
                                      alt={post.title}
                                      style={{
                                        width: '90px',
                                        height: '90px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        background: '#eee',
                                      }}
                                    />
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        fontWeight: 600,
                                        fontSize: '1em',
                                        textAlign: 'center',
                                        margin: '.25em',
                                        // width: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {post.title}
                                      <div style={{ fontSize: '.95em', color: '#555' }}>
                                        ID: {post.id}
                                      </div>
                                      <div style={{ fontSize: '.95em', color: '#555' }}>
                                        ${price}
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            } else {
                              return <div>No posts found.</div>;
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="sales-detail-row">
                    <label>Price:</label>
                    <input
                      type="number"
                      className="tracking-input"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                  </div>

                  <div className="sales-detail-row">
                    <label>Tracking Number:</label>
                    <input
                      type="text"
                      className="tracking-input"
                      value={newTracking}
                      onChange={(e) => setNewTracking(e.target.value)}
                    />
                  </div>

                  <button className="save-tracking-button" onClick={handleCreateSale}>
                    Save Sale
                  </button>

                  <button className="cancel-button" onClick={() => setIsCreatingSale(false)}>
                    Cancel
                  </button>
                </div>
              ) : !currentSale ? (
                <div className="no-sale-selected">
                  <p>Select a sale to view details</p>
                </div>
              ) : (
                <div className="sales-detail">
                  <img src={currentSale.image_url} alt="Piece" className="sales-detail-img" />

                  {currentSale.tracking_number && currentSale.tracking_number !== '0' && (
                    <div
                      className="tracking-link"
                      onClick={() => handleTrackingClick(currentSale.tracking_number)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTrackingClick(currentSale.tracking_number);
                      }}
                    >
                      <img
                        alt="USPS"
                        className="auction-result-thumb"
                        style={{ width: '50px', height: '50px', margin: '.5rem 0 0 .25rem' }}
                        src="../../../usps.png"
                      />

                      <p style={{ textAlign: 'left', margin: 0 }}>
                        <span>Tracking number:</span>
                        <br />
                        <span>{currentSale.tracking_number}</span>
                      </p>
                    </div>
                  )}

                  {/* PAID STATUS + TOGGLE */}
                  <div className="sales-paid-status">
                    <div
                      className="sales-paid-status-indicator"
                      style={{ backgroundColor: currentSale.is_paid ? 'green' : 'yellow' }}
                    >
                      {currentSale.is_paid ? 'Paid' : 'Not Paid'}
                    </div>

                    <button
                      className="sale-paid-toggle-button"
                      style={{
                        border: '1px solid',
                        borderColor: currentSale.is_paid ? 'green' : 'yellow',
                      }}
                      onClick={async () => {
                        try {
                          await updateSalePaidStatus(currentSale.id, !currentSale.is_paid);
                          await loadSales();
                        } catch (e) {
                          toast.error(`${e.message}` || 'Error updating payment status', {
                            theme: 'colored',
                            draggable: true,
                            draggablePercent: 60,
                            toastId: 'admin-sales-paid-1',
                            autoClose: 3000,
                          });
                        }
                      }}
                    >
                      {currentSale.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                    </button>
                  </div>

                  <div className="sales-detail-row">
                    <label>Buyer:</label>
                    <span>{currentSale.buyer_first_name}</span>
                    <span>{currentSale.buyer_last_name?.slice(0, 1)}.</span>
                  </div>

                  <div className="sales-detail-row" style={{ alignItems: 'flex-start' }}>
                    <label>Address:</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                      {/* Resolve buyer user to show address */}
                      {(() => {
                        const buyerEmail = (currentSale.buyer_email || '').toLowerCase();
                        const buyerUser = users.find(
                          (u) => (u.email || u.user_email || '').toLowerCase() === buyerEmail
                        );
                        const address = buyerUser?.address;
                        if (!address) {
                          return <div className="address-missing">No shipping address on file</div>;
                        }
                        return (
                          <div className="selected-user-address">
                            <div className="selected-user-address-actions">
                              <button
                                type="button"
                                className="copy-address-button"
                                onClick={handleCopyCurrentSaleAddress}
                                disabled={!address}
                              >
                                Copy
                              </button>
                            </div>
                            <div className="address-lines">
                              <div>{address.addressLine1}</div>
                              {address.addressLine2 ? <div>{address.addressLine2}</div> : null}
                              <div>
                                {address.city}, {address.state} {address.postalCode}
                              </div>
                              <div>{address.countryCode || 'US'}</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="sales-detail-row">
                    <label>Email:</label>
                    <span>{currentSale.buyer_email}</span>
                  </div>

                  <div className="sales-detail-row">
                    <label>Piece:</label>
                    <span>{currentSale.post_title}</span>
                  </div>

                  <div className="sales-detail-row">
                    <label>Price:</label>
                    <span>${currentSale.price}</span>
                  </div>

                  <div className="sales-detail-row">
                    <label>Tracking Number:</label>
                    <input
                      type="text"
                      className="tracking-input"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="save-tracking-button" onClick={handleSaveTracking}>
                      Save Tracking
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
