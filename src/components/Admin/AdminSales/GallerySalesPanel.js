import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import {
  FIRST_ITEM_SHIPPING,
  ADDITIONAL_ITEM_SHIPPING,
} from '../../../hooks/useAccountActivity.js';
import {
  getOrderItems,
  getOrderItemsSubtotal,
  getOrderTotal,
} from '../../../services/salesOrder.js';

const formatMoney = (amount) => `$${Number(amount || 0).toFixed(2)}`;

// Seed value only. The admin can always type over it.
const estimateShipping = (itemCount) => {
  if (itemCount <= 0) return 0;
  return FIRST_ITEM_SHIPPING + (itemCount - 1) * ADDITIONAL_ITEM_SHIPPING;
};

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
  const navigate = useNavigate();
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

  const prefillUserResolved = useRef(false);
  const prefillRevealed = useRef(false);
  const salesPanelRef = useRef(null);
  const { posts } = usePosts();

  // Modal state for finding post
  const [showPostModal, setShowPostModal] = useState(false);

  // state for creating a sale
  const [newBuyerEmail, setNewBuyerEmail] = useState('');
  const [newItems, setNewItems] = useState([]);
  const [newShipping, setNewShipping] = useState('0');
  const [shippingEdited, setShippingEdited] = useState(false);
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

  const applyItems = (nextItems) => {
    setNewItems(nextItems);
    if (!shippingEdited) setNewShipping(String(estimateShipping(nextItems.length)));
  };

  const handleSelectPost = (post) => {
    setShowPostModal(false);

    const alreadyAdded = newItems.some((item) => String(item.postId) === String(post.id));
    if (alreadyAdded) {
      toast.info('That piece is already on this sale.', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'admin-sales-duplicate-piece',
        autoClose: 3000,
      });
      return;
    }

    applyItems([
      ...newItems,
      {
        postId: post.id,
        title: post.title,
        imageUrl: post.image_url || post.imageUrl,
        price: String(getPostPrice(post)),
      },
    ]);
  };

  const handleRemoveItem = (postId) => {
    applyItems(newItems.filter((item) => String(item.postId) !== String(postId)));
  };

  const handleItemPriceChange = (postId, price) => {
    setNewItems(
      newItems.map((item) => (String(item.postId) === String(postId) ? { ...item, price } : item))
    );
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

  const revealDetailPanel = () => {
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

    revealDetailPanel();
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
    if (newItems.length === 0) {
      toast.error('Add at least one piece to the sale.', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'admin-sales-no-items',
        autoClose: 3000,
      });
      return;
    }

    try {
      await createSale(
        newBuyerEmail,
        newItems.map((item) => ({ postId: item.postId, price: item.price })),
        newShipping,
        newTracking
      );

      // reset inputs
      setNewBuyerEmail('');
      setNewItems([]);
      setNewShipping('0');
      setShippingEdited(false);
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
    revealDetailPanel();
  };

  // the one new refactor line
  const currentSale = selectedSale ? sales.find((s) => s.id === selectedSale) : null;

  useEffect(() => {
    const prefill = location.state?.prefill;
    if (!prefill || prefillApplied) return;

    setIsCreatingSale(true);

    if (prefill.buyerEmail) setNewBuyerEmail(prefill.buyerEmail);

    const prefilledPieces = (prefill.pieces || []).filter((piece) => piece?.id);
    if (prefilledPieces.length > 0) {
      setNewItems(
        prefilledPieces.map((piece) => {
          const hasDiscount =
            piece.discountedPrice !== null &&
            piece.discountedPrice !== undefined &&
            !Number.isNaN(piece.discountedPrice);
          const priceToUse = hasDiscount ? piece.discountedPrice : piece.price;

          return {
            postId: piece.id,
            title: piece.title,
            imageUrl: piece.imageUrl || piece.image_url,
            price: priceToUse === null || priceToUse === undefined ? '' : String(priceToUse),
          };
        })
      );
      setNewShipping(String(estimateShipping(prefilledPieces.length)));
    }

    setPrefillApplied(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, prefillApplied]);

  useEffect(() => {
    if (!prefillApplied || loading || prefillRevealed.current) return;
    prefillRevealed.current = true;
    revealDetailPanel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillApplied, loading]);

  useEffect(() => {
    const prefillUser = location.state?.prefill?.user;
    if (!prefillUser || prefillUserResolved.current || users.length === 0) return;
    if (!prefillUser.id && !prefillUser.email) return;

    prefillUserResolved.current = true;

    const match = users.find(
      (u) =>
        (prefillUser.id && Number(u.id) === Number(prefillUser.id)) ||
        (prefillUser.email &&
          ((u.email && u.email.toLowerCase() === prefillUser.email.toLowerCase()) ||
            (u.user_email && u.user_email.toLowerCase() === prefillUser.email.toLowerCase())))
    );
    if (match) {
      setSelectedUser(match);
    }
  }, [location.state, users]);

  const stageCounts = sales.reduce(
    (totals, order) => {
      const completed = countCompletedStages({
        isPaid: order.is_paid,
        trackingNumber: order.tracking_number,
      });
      if (completed === 1) totals.awaitingPayment += 1;
      if (completed === 2) totals.readyToShip += 1;
      totals.gross += getOrderTotal(order);
      totals.pieces += getOrderItems(order).length;
      return totals;
    },
    { awaitingPayment: 0, readyToShip: 0, gross: 0, pieces: 0 }
  );

  const statTiles = [
    { label: 'Orders', value: sales.length },
    { label: 'Pieces', value: stageCounts.pieces },
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

  const newItemsSubtotal = newItems.reduce(
    (runningTotal, item) => runningTotal + (Number(item.price) || 0),
    0
  );
  const newShippingAmount = Number(newShipping) || 0;

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

  const renderOrderTotals = (itemsSubtotal, shippingAmount) => (
    <dl className="slg-order-totals">
      <div className="slg-order-total-line">
        <dt>Items</dt>
        <dd>{formatMoney(itemsSubtotal)}</dd>
      </div>
      <div className="slg-order-total-line">
        <dt>Shipping</dt>
        <dd>{formatMoney(shippingAmount)}</dd>
      </div>
      <div className="slg-order-total-line slg-order-total-line--grand">
        <dt>Total</dt>
        <dd>{formatMoney(itemsSubtotal + shippingAmount)}</dd>
      </div>
    </dl>
  );

  const renderAddressLines = (address) => (
    <div className="admin-sales-detail-address-lines">
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
      <div className="admin-sales-stats">
        {statTiles.map((tile) => (
          <div
            key={tile.label}
            className={`admin-sales-stat${tile.tone ? ` admin-sales-stat--${tile.tone}` : ''}`}
          >
            <span className="admin-sales-stat-label">{tile.label}</span>
            <span className="admin-sales-stat-value">{tile.value}</span>
          </div>
        ))}
      </div>

      <div className="admin-sales-layout">
        <main className="admin-sales-list-column">
          <div className="admin-sales-toolbar">
            <h2 className="admin-sales-list-heading">Gallery sales</h2>

            <button
              type="button"
              className="admin-sales-button admin-sales-button--primary"
              onClick={handleStartNewSale}
            >
              Add sale
            </button>

            <p className="admin-sales-list-count">{sales.length}</p>
          </div>

          {(() => {
            if (loading) {
              return <p className="admin-sales-empty-message">Loading sales…</p>;
            }
            if (sales.length === 0) {
              return (
                <p className="admin-sales-empty-message">
                  No gallery sales yet. Add one to start tracking payment and shipping.
                </p>
              );
            }
            return (
              <ul className="admin-sales-list">
                {sales.map((order) => {
                  const completedStages = countCompletedStages({
                    isPaid: order.is_paid,
                    trackingNumber: order.tracking_number,
                  });
                  const items = getOrderItems(order);
                  const [firstItem] = items;
                  return (
                    <li key={order.id}>
                      <button
                        type="button"
                        className={`admin-sales-row${selectedSale === order.id ? ' admin-sales-row--selected' : ''}`}
                        aria-pressed={selectedSale === order.id}
                        onClick={() => handleSelectSale(order.id)}
                      >
                        <span className="admin-sales-row-thumbnail">
                          <img src={firstItem?.post_image_url} alt="" />
                          {items.length > 1 && (
                            <span className="admin-sales-row-item-count">{items.length}</span>
                          )}
                        </span>

                        <span className="admin-sales-row-details">
                          <span className="admin-sales-row-title">
                            {items.length > 1
                              ? `${items.length} pieces · ${firstItem?.post_title}`
                              : firstItem?.post_title}
                          </span>
                          <span className="admin-sales-row-buyer">
                            {`${order.buyer_first_name || ''} ${order.buyer_last_name || ''}`.trim()}
                            {' · '}
                            {order.buyer_email}
                          </span>
                        </span>

                        <span className="admin-sales-row-price">
                          {formatMoney(getOrderTotal(order))}
                        </span>

                        <SaleStages completedCount={completedStages} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            );
          })()}
        </main>

        <aside className="admin-sales-detail-column" ref={salesPanelRef}>
          {(() => {
            if (isCreatingSale) {
              return (
                <div className="admin-sales-detail-panel">
                  <div className="admin-sales-detail-panel-header">
                    <h2 className="admin-sales-detail-panel-title">New sale</h2>
                    <button
                      type="button"
                      className="admin-sales-button"
                      onClick={() => setIsCreatingSale(false)}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="admin-sales-detail-panel-content">
                    <div className="form-field slg-user-search">
                      <label className="form-field-label" htmlFor="slg-customer-search">
                        Find customer
                      </label>
                      <input
                        id="slg-customer-search"
                        type="text"
                        className="form-input"
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
                          <div className="admin-sales-detail-address">
                            {renderAddressLines(selectedUser.address)}
                            <button
                              type="button"
                              className="admin-sales-button"
                              onClick={handleCopyAddress}
                            >
                              Copy address
                            </button>
                          </div>
                        ) : (
                          <p className="admin-sales-detail-fact-value admin-sales-detail-fact-value--missing">
                            No shipping address on file
                          </p>
                        )}
                      </div>
                    )}

                    <div className="form-field">
                      <label className="form-field-label" htmlFor="slg-buyer-email">
                        Buyer email
                      </label>
                      <input
                        id="slg-buyer-email"
                        type="text"
                        className="form-input"
                        value={newBuyerEmail}
                        onChange={(e) => setNewBuyerEmail(e.target.value)}
                      />
                      <button
                        type="button"
                        className="admin-sales-button"
                        onClick={handleSearchByEmail}
                      >
                        Find user by email
                      </button>
                    </div>

                    <div className="form-field">
                      <span className="form-field-label">Pieces</span>

                      {newItems.length === 0 ? (
                        <p className="admin-sales-detail-fact-value admin-sales-detail-fact-value--missing">
                          No pieces on this sale yet.
                        </p>
                      ) : (
                        <ul className="slg-sale-items">
                          {newItems.map((item) => (
                            <li key={item.postId} className="slg-sale-item">
                              <span className="slg-sale-item-thumb">
                                <img src={item.imageUrl} alt="" />
                              </span>

                              <span className="slg-sale-item-meta">
                                <span className="slg-sale-item-title">{item.title}</span>
                                <span className="slg-sale-item-sub">ID {item.postId}</span>
                              </span>

                              <span className="form-money-input-wrapper slg-sale-item-price">
                                <input
                                  type="number"
                                  className="form-input"
                                  aria-label={`Price for ${item.title}`}
                                  value={item.price}
                                  onChange={(event) =>
                                    handleItemPriceChange(item.postId, event.target.value)
                                  }
                                />
                              </span>

                              <button
                                type="button"
                                className="slg-sale-item-remove"
                                aria-label={`Remove ${item.title}`}
                                onClick={() => handleRemoveItem(item.postId)}
                              >
                                ✕
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      <button
                        type="button"
                        className="admin-sales-button"
                        onClick={() => setShowPostModal(true)}
                      >
                        Add piece
                      </button>
                    </div>

                    <div className="form-field">
                      <label className="form-field-label" htmlFor="slg-sale-shipping">
                        Shipping
                      </label>
                      <span className="form-money-input-wrapper">
                        <input
                          id="slg-sale-shipping"
                          type="number"
                          className="form-input"
                          value={newShipping}
                          onChange={(event) => {
                            setShippingEdited(true);
                            setNewShipping(event.target.value);
                          }}
                        />
                      </span>
                    </div>

                    <div className="form-field">
                      <label className="form-field-label" htmlFor="slg-new-tracking">
                        Tracking number
                      </label>
                      <input
                        id="slg-new-tracking"
                        type="text"
                        className="form-input"
                        value={newTracking}
                        onChange={(e) => setNewTracking(e.target.value)}
                      />
                    </div>

                    {renderOrderTotals(newItemsSubtotal, newShippingAmount)}

                    <div className="admin-sales-detail-actions">
                      <button
                        type="button"
                        className="admin-sales-button admin-sales-button--primary admin-sales-button--wide"
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
                <div className="admin-sales-detail-panel">
                  <div className="admin-sales-detail-panel-header">
                    <h2 className="admin-sales-detail-panel-title">Sale detail</h2>
                  </div>
                  <p className="admin-sales-placeholder-message">
                    Pick a sale to see the buyer, the address, and where it is in the pipeline.
                  </p>
                </div>
              );
            }

            return (
              <div className="admin-sales-detail-panel">
                <div className="admin-sales-detail-panel-header">
                  <h2 className="admin-sales-detail-panel-title">Sale detail</h2>
                  <button
                    type="button"
                    className="admin-sales-button"
                    onClick={() => setSelectedSale(null)}
                  >
                    Close
                  </button>
                </div>

                <div className="admin-sales-detail-panel-content">
                  <SaleStages completedCount={currentSaleStages} variant="detail" />

                  <ul className="admin-sales-detail-pieces">
                    {getOrderItems(currentSale).map((item) => (
                      <li key={item.id} className="admin-sales-detail-piece">
                        <img
                          src={item.post_image_url}
                          alt=""
                          className="admin-sales-detail-piece-image"
                        />
                        <div className="admin-sales-detail-piece-details">
                          <h3 className="admin-sales-detail-piece-title">{item.post_title}</h3>
                          <span className="admin-sales-detail-piece-price">
                            {formatMoney(item.price)}
                          </span>
                          <div className="admin-sales-detail-actions">
                            <button
                              type="button"
                              className="admin-sales-button"
                              onClick={() => navigate(`/${item.post_id}`)}
                            >
                              View post
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {renderOrderTotals(
                    getOrderItemsSubtotal(currentSale),
                    Number(currentSale.shipping_cost) || 0
                  )}

                  <div className="admin-sales-detail-actions">
                    <button
                      type="button"
                      className={`admin-sales-button admin-sales-button--wide${
                        currentSale.is_paid ? '' : ' admin-sales-button--primary'
                      }`}
                      onClick={handleTogglePaid}
                    >
                      {currentSale.is_paid ? 'Mark unpaid' : 'Mark paid'}
                    </button>
                  </div>

                  <dl className="admin-sales-detail-facts">
                    <div className="admin-sales-detail-fact">
                      <dt className="admin-sales-detail-fact-label">Buyer</dt>
                      <dd className="admin-sales-detail-fact-value">
                        {currentSale.buyer_first_name} {currentSale.buyer_last_name?.slice(0, 1)}.
                      </dd>
                    </div>

                    <div className="admin-sales-detail-fact">
                      <dt className="admin-sales-detail-fact-label">Email</dt>
                      <dd className="admin-sales-detail-fact-value">{currentSale.buyer_email}</dd>
                    </div>

                    <div className="admin-sales-detail-fact">
                      <dt className="admin-sales-detail-fact-label">Ship to</dt>
                      <dd className="admin-sales-detail-fact-value">
                        {currentSaleAddress ? (
                          <div className="admin-sales-detail-address">
                            {renderAddressLines(currentSaleAddress)}
                            <button
                              type="button"
                              className="admin-sales-button"
                              onClick={handleCopyCurrentSaleAddress}
                            >
                              Copy address
                            </button>
                          </div>
                        ) : (
                          <span className="admin-sales-detail-fact-value--missing">
                            No shipping address on file
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>

                  {hasRealTracking(currentSale.tracking_number) && (
                    <a
                      className="admin-sales-tracking-link"
                      href={buildTrackingUrl(currentSale.tracking_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        alt=""
                        className="admin-sales-tracking-carrier-logo"
                        src="../../../usps.png"
                      />
                      <span className="admin-sales-tracking-number">
                        {currentSale.tracking_number}
                      </span>
                    </a>
                  )}

                  <div className="form-field admin-sales-tracking-field">
                    <label className="form-field-label" htmlFor="gallery-sales-tracking-number">
                      Tracking number
                    </label>
                    <input
                      id="gallery-sales-tracking-number"
                      type="text"
                      className="form-input"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="admin-sales-save-tracking-button"
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
              <p className="admin-sales-placeholder-message">No pieces to choose from.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GallerySalesPanel;
