import { useState, useEffect, useMemo, useRef } from 'react';
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
import SaleStages from './SaleStages.js';
import { countCompletedStages, hasRealTracking } from './saleStatus.js';

const formatMoney = (amount) => `$${Number(amount || 0).toLocaleString()}`;

const getInitial = (...candidates) => {
  const source = candidates.find(Boolean) || '?';
  return source.charAt(0).toUpperCase();
};

const getFullName = (user) => {
  const profile = user?.profile || {};
  return `${profile.firstName || 'Unknown'} ${profile.lastName || ''}`.trim();
};

const GallerySalesPanel = () => {
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
  const salesPanelRef = useRef(null);
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

  const revealDetailPanelOnMobile = () => {
    if (window.matchMedia('(min-width: 1100px)').matches) return;
    requestAnimationFrame(() => {
      salesPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSelectSale = (saleId) => {
    setIsCreatingSale(false);
    setSelectedSale(saleId);

    const sale = sales.find((s) => s.id === saleId);
    if (sale) {
      setTrackingInput(sale.tracking_number || '');
    }

    revealDetailPanelOnMobile();
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

  const buildTrackingUrl = (trackingNumber) =>
    `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`;

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

  const handleTogglePaid = async () => {
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
  };

  const handleStartNewSale = () => {
    setSelectedSale(null);
    setIsCreatingSale(true);
    setSelectedUser(null);
    setSearchTerm('');
    setDebouncedTerm('');
    revealDetailPanelOnMobile();
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

  const stageCounts = sales.reduce(
    (totals, sale) => {
      const completed = countCompletedStages({
        isPaid: sale.is_paid,
        trackingNumber: sale.tracking_number,
      });
      if (completed === 1) totals.awaitingPayment += 1;
      if (completed === 2) totals.readyToShip += 1;
      totals.gross += Number(sale.price) || 0;
      return totals;
    },
    { awaitingPayment: 0, readyToShip: 0, gross: 0 }
  );

  const statTiles = [
    { label: 'Sales', value: sales.length },
    {
      label: 'Unpaid',
      value: stageCounts.awaitingPayment,
      tone: stageCounts.awaitingPayment > 0 ? 'bad' : null,
    },
    {
      label: 'To ship',
      value: stageCounts.readyToShip,
      tone: stageCounts.readyToShip > 0 ? 'wait' : null,
    },
    { label: 'Gross', value: formatMoney(stageCounts.gross) },
  ];

  const currentSaleStages = currentSale
    ? countCompletedStages({
        isPaid: currentSale.is_paid,
        trackingNumber: currentSale.tracking_number,
      })
    : 1;

  const buyerUserForCurrentSale = currentSale
    ? users.find(
        (u) =>
          (u.email || u.user_email || '').toLowerCase() ===
          (currentSale.buyer_email || '').toLowerCase()
      )
    : null;
  const currentSaleAddress = buyerUserForCurrentSale?.address;

  const renderUserIdentity = (user) => (
    <>
      {user.profile?.imageUrl || user.profile?.image_url ? (
        <img
          src={user.profile.imageUrl || user.profile.image_url}
          alt=""
          className="slg-user-avatar"
        />
      ) : (
        <div className="slg-user-avatar slg-user-avatar--fallback" aria-hidden="true">
          {getInitial(user.profile?.firstName, user.email, user.user_email)}
        </div>
      )}
      <span className="slg-user-meta">
        <span className="slg-user-name">{getFullName(user)}</span>
        <span className="slg-user-email">{user.email || user.user_email}</span>
      </span>
    </>
  );

  const renderAddressLines = (address) => (
    <div className="slg-sale-address-lines">
      <div>{address.addressLine1}</div>
      {address.addressLine2 ? <div>{address.addressLine2}</div> : null}
      <div>
        {address.city}, {address.state} {address.postalCode}
      </div>
      <div>{address.countryCode || 'US'}</div>
    </div>
  );

  return (
    <>
      <div className="slg-sales-stats">
        {statTiles.map((tile) => (
          <div
            key={tile.label}
            className={`slg-sales-stat${tile.tone ? ` slg-sales-stat--${tile.tone}` : ''}`}
          >
            <span className="slg-sales-stat-label">{tile.label}</span>
            <span className="slg-sales-stat-value">{tile.value}</span>
          </div>
        ))}
      </div>

      <div className="slg-sales-body">
        <main className="slg-sales-main">
          <div className="slg-sales-toolbar">
            <h2 className="slg-sales-heading">Gallery sales</h2>

            <button
              type="button"
              className="slg-sales-button slg-sales-button--primary"
              onClick={handleStartNewSale}
            >
              Add sale
            </button>

            <p className="slg-sales-count">{sales.length}</p>
          </div>

          {(() => {
            if (loading) {
              return <p className="slg-sale-empty">Loading sales…</p>;
            }
            if (sales.length === 0) {
              return (
                <p className="slg-sale-empty">
                  No gallery sales yet. Add one to start tracking payment and shipping.
                </p>
              );
            }
            return (
              <ul className="slg-sale-list">
                {sales.map((sale) => {
                  const completedStages = countCompletedStages({
                    isPaid: sale.is_paid,
                    trackingNumber: sale.tracking_number,
                  });
                  return (
                    <li key={sale.id}>
                      <button
                        type="button"
                        className={`slg-sale-row${selectedSale === sale.id ? ' slg-sale-row--on' : ''}`}
                        aria-pressed={selectedSale === sale.id}
                        onClick={() => handleSelectSale(sale.id)}
                      >
                        <span className="slg-sale-thumb">
                          <img src={sale.image_url} alt="" />
                        </span>

                        <span className="slg-sale-identity">
                          <span className="slg-sale-title">{sale.post_title}</span>
                          <span className="slg-sale-buyer">
                            {`${sale.buyer_first_name || ''} ${sale.buyer_last_name || ''}`.trim()}
                            {' · '}
                            {sale.buyer_email}
                          </span>
                        </span>

                        <span className="slg-sale-price">{formatMoney(sale.price)}</span>

                        <SaleStages completedCount={completedStages} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            );
          })()}
        </main>

        <aside className="slg-sales-rail" ref={salesPanelRef}>
          {(() => {
            if (isCreatingSale) {
              return (
                <div className="slg-sale-panel">
                  <div className="slg-sale-panel-head">
                    <h2 className="slg-sale-panel-title">New sale</h2>
                    <button
                      type="button"
                      className="slg-sales-button"
                      onClick={() => setIsCreatingSale(false)}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="slg-sale-panel-body">
                    <div className="slg-field slg-user-search">
                      <label className="slg-field-label" htmlFor="slg-customer-search">
                        Find customer
                      </label>
                      <input
                        id="slg-customer-search"
                        type="text"
                        className="slg-input"
                        placeholder="Name or email"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowUserResults(true);
                        }}
                        onFocus={() => setShowUserResults(true)}
                      />
                      {showUserResults && debouncedTerm && (
                        <div className="slg-user-results">
                          {filteredUsers.length === 0 ? (
                            <p className="slg-user-results-empty">No customers match that.</p>
                          ) : (
                            filteredUsers.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                className="slg-user-result"
                                onClick={() => handleSelectUser(user)}
                              >
                                {renderUserIdentity(user)}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {selectedUser && (
                      <div className="slg-user-card">
                        <div className="slg-user-identity">{renderUserIdentity(selectedUser)}</div>

                        {selectedUser.address ? (
                          <div className="slg-sale-address">
                            {renderAddressLines(selectedUser.address)}
                            <button
                              type="button"
                              className="slg-sales-button"
                              onClick={handleCopyAddress}
                            >
                              Copy address
                            </button>
                          </div>
                        ) : (
                          <p className="slg-sale-fact-value slg-sale-fact-value--missing">
                            No shipping address on file
                          </p>
                        )}
                      </div>
                    )}

                    <div className="slg-field">
                      <label className="slg-field-label" htmlFor="slg-buyer-email">
                        Buyer email
                      </label>
                      <input
                        id="slg-buyer-email"
                        type="text"
                        className="slg-input"
                        value={newBuyerEmail}
                        onChange={(e) => setNewBuyerEmail(e.target.value)}
                      />
                      <button
                        type="button"
                        className="slg-sales-button"
                        onClick={handleSearchByEmail}
                      >
                        Find user by email
                      </button>
                    </div>

                    <div className="slg-field">
                      <label className="slg-field-label" htmlFor="slg-piece-id">
                        Piece ID
                      </label>
                      <input
                        id="slg-piece-id"
                        type="number"
                        className="slg-input"
                        value={newPieceId}
                        onChange={(e) => setNewPieceId(e.target.value)}
                      />
                      <button
                        type="button"
                        className="slg-sales-button"
                        onClick={() => setShowPostModal(true)}
                      >
                        Find post
                      </button>
                    </div>

                    <div className="slg-field">
                      <label className="slg-field-label" htmlFor="slg-sale-price">
                        Price
                      </label>
                      <span className="slg-input-money">
                        <input
                          id="slg-sale-price"
                          type="number"
                          className="slg-input"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                        />
                      </span>
                    </div>

                    <div className="slg-field">
                      <label className="slg-field-label" htmlFor="slg-new-tracking">
                        Tracking number
                      </label>
                      <input
                        id="slg-new-tracking"
                        type="text"
                        className="slg-input"
                        value={newTracking}
                        onChange={(e) => setNewTracking(e.target.value)}
                      />
                    </div>

                    <div className="slg-sale-actions">
                      <button
                        type="button"
                        className="slg-sales-button slg-sales-button--primary slg-sales-button--wide"
                        onClick={handleCreateSale}
                      >
                        Save sale
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            if (!currentSale) {
              return (
                <div className="slg-sale-panel">
                  <div className="slg-sale-panel-head">
                    <h2 className="slg-sale-panel-title">Sale detail</h2>
                  </div>
                  <p className="slg-sale-placeholder">
                    Pick a sale to see the buyer, the address, and where it is in the pipeline.
                  </p>
                </div>
              );
            }

            return (
              <div className="slg-sale-panel">
                <div className="slg-sale-panel-head">
                  <h2 className="slg-sale-panel-title">Sale detail</h2>
                  <button
                    type="button"
                    className="slg-sales-button"
                    onClick={() => setSelectedSale(null)}
                  >
                    Close
                  </button>
                </div>

                <div className="slg-sale-panel-body">
                  <SaleStages completedCount={currentSaleStages} variant="detail" />

                  <div className="slg-sale-piece">
                    <img src={currentSale.image_url} alt="" className="slg-sale-piece-image" />
                    <div className="slg-sale-piece-meta">
                      <h3 className="slg-sale-piece-title">{currentSale.post_title}</h3>
                      <span className="slg-sale-piece-price">{formatMoney(currentSale.price)}</span>
                    </div>
                  </div>

                  <div className="slg-sale-actions">
                    <button
                      type="button"
                      className="slg-sales-button slg-sales-button--wide"
                      onClick={handleTogglePaid}
                    >
                      {currentSale.is_paid ? 'Mark unpaid' : 'Mark paid'}
                    </button>
                  </div>

                  <dl className="slg-sale-facts">
                    <div className="slg-sale-fact">
                      <dt className="slg-sale-fact-label">Buyer</dt>
                      <dd className="slg-sale-fact-value">
                        {currentSale.buyer_first_name} {currentSale.buyer_last_name?.slice(0, 1)}.
                      </dd>
                    </div>

                    <div className="slg-sale-fact">
                      <dt className="slg-sale-fact-label">Email</dt>
                      <dd className="slg-sale-fact-value">{currentSale.buyer_email}</dd>
                    </div>

                    <div className="slg-sale-fact">
                      <dt className="slg-sale-fact-label">Ship to</dt>
                      <dd className="slg-sale-fact-value">
                        {currentSaleAddress ? (
                          <div className="slg-sale-address">
                            {renderAddressLines(currentSaleAddress)}
                            <button
                              type="button"
                              className="slg-sales-button"
                              onClick={handleCopyCurrentSaleAddress}
                            >
                              Copy address
                            </button>
                          </div>
                        ) : (
                          <span className="slg-sale-fact-value--missing">
                            No shipping address on file
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>

                  {hasRealTracking(currentSale.tracking_number) && (
                    <a
                      className="slg-sale-tracking-link"
                      href={buildTrackingUrl(currentSale.tracking_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img alt="" className="slg-sale-tracking-mark" src="../../../usps.png" />
                      <span className="slg-sale-tracking-text">
                        <span className="slg-sale-tracking-caption">Track with USPS</span>
                        <span className="slg-sale-tracking-number">
                          {currentSale.tracking_number}
                        </span>
                      </span>
                    </a>
                  )}

                  <div className="slg-field">
                    <label className="slg-field-label" htmlFor="slg-sale-tracking">
                      Tracking number
                    </label>
                    <input
                      id="slg-sale-tracking"
                      type="text"
                      className="slg-input"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                    />
                  </div>

                  <div className="slg-sale-actions">
                    <button
                      type="button"
                      className="slg-sales-button slg-sales-button--primary slg-sales-button--wide"
                      onClick={handleSaveTracking}
                    >
                      Save tracking
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </aside>
      </div>

      {showPostModal && (
        <div className="slg-modal-scrim">
          <div className="slg-modal slg-modal--wide" role="dialog" aria-modal="true">
            <div className="slg-modal-head">
              <h2 className="slg-modal-title">Select a piece</h2>
              <button
                type="button"
                className="slg-modal-close"
                onClick={() => setShowPostModal(false)}
                aria-label="Close piece finder"
              >
                ✕
              </button>
            </div>

            {posts && posts.length > 0 ? (
              <div className="slg-post-picker">
                {posts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    className="slg-post-option"
                    onClick={() => handleSelectPost(post)}
                  >
                    <img src={post.image_url || post.imageUrl} alt="" />
                    <span className="slg-post-option-meta">
                      <span className="slg-post-option-title">{post.title}</span>
                      <span className="slg-post-option-sub">ID {post.id}</span>
                      <span className="slg-post-option-sub">{formatMoney(getPostPrice(post))}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="slg-sale-placeholder">No pieces to choose from.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GallerySalesPanel;
