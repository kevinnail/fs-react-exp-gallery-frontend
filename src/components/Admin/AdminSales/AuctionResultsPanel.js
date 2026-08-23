import { useEffect, useState } from 'react';
import { getBids } from '../../../services/fetch-bids.js';
import {
  getAdminAuctions,
  markAuctionPaid,
  updateAuctionTracking,
} from '../../../services/fetch-auctions.js';
import './AdminSales.css';
import './AuctionResultsPanel.css';
import { toast } from 'react-toastify';
import websocketService from '../../../services/websocket.js';
import { useAuctionEventsStore } from '../../../stores/auctionEventsStore.js';
import { useNavigate } from 'react-router-dom';
import Loading from '../../Loading/Loading.js';
import { getAllUsers } from '../../../services/fetch-utils.js';
import SaleStages from './SaleStages.js';
import { countCompletedStages, hasRealTracking } from './saleStatus.js';

const formatMoney = (amount) => `$${Number(amount || 0).toLocaleString()}`;

const AuctionResultsPanel = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingAuctionId, setTrackingAuctionId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [copyToastId] = useState('auction-tracking-copy-address');

  // Resolve current auction winner and address for tracking modal
  let selectedAuction = null;
  if (trackingAuctionId) {
    selectedAuction = auctions.find((x) => x.id === trackingAuctionId) || null;
  }

  let winner = null;
  if (selectedAuction) {
    if (selectedAuction.winner) {
      winner = selectedAuction.winner;
    } else if (selectedAuction.topBid && selectedAuction.topBid.user) {
      winner = selectedAuction.topBid.user;
    }
  }

  let resolvedUser = null;
  if (winner) {
    for (let i = 0; i < users.length; i += 1) {
      const user = users[i];

      if (winner.id && Number(user.id) === Number(winner.userId)) {
        resolvedUser = user;
        break;
      }
      if (
        winner.email &&
        (user.email || user.user_email || '').toLowerCase() === winner.email.toLowerCase()
      ) {
        resolvedUser = user;
        break;
      }
    }
  }

  let address = null;
  if (resolvedUser && resolvedUser.address) {
    address = resolvedUser.address;
  }
  const profile = resolvedUser?.profile || {};
  const displayName =
    `${profile.firstName || winner?.firstName || ''} ${profile.lastName || winner?.lastName || ''}`.trim();

  const copyAddressText = () => {
    if (!address) return;
    const countryCode = (address.countryCode || 'US').toUpperCase();
    const lines = [
      displayName || resolvedUser?.email || resolvedUser?.user_email || '',
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
        toastId: copyToastId,
        autoClose: 2000,
      });
    };
    const onFail = () => {
      toast.error('Failed to copy address', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: copyToastId,
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
          toastId: copyToastId,
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

  const lastBidUpdate = useAuctionEventsStore((s) => s.lastBidUpdate);

  useEffect(() => {
    if (!lastBidUpdate) return;
    const auctionId = Number(lastBidUpdate.id);

    (async () => {
      try {
        const bids = await getBids(auctionId);
        if (Array.isArray(bids) && bids.length > 0) {
          const topBid = bids.reduce((max, b) => (b.bidAmount > max.bidAmount ? b : max));
          setAuctions((prev) =>
            prev.map((a) =>
              Number(a.id) === auctionId ? { ...a, topBid, winner: topBid.user } : a
            )
          );
        }
      } catch (err) {
        console.error('Error updating admin high bid:', err);
      }
    })();
  }, [lastBidUpdate]);

  const openTrackingModal = (auctionId, existingTracking = '') => {
    setTrackingAuctionId(auctionId);
    setTrackingInput(existingTracking);
    setShowTrackingModal(true);
  };

  const handleSaveTracking = async () => {
    setShowTrackingModal(false);
    setLoading(true);
    try {
      await updateAuctionTracking(trackingAuctionId, trackingInput.trim());

      setAuctions((prev) =>
        prev.map((x) =>
          x.id === trackingAuctionId ? { ...x, trackingNumber: trackingInput.trim() } : x
        )
      );

      setLoading(false);
      toast.success('Tracking saved and email sent!', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-track-fail',
        autoClose: 3000,
      });
    } catch (e) {
      toast.error(`${e.message}` || 'Error saving tracking', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-track-fail',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const allAuctions = await getAdminAuctions();
        const users = await getAllUsers();
        setUsers(Array.isArray(users) ? users : []);

        // hydrate each auction with top bid + bidder if available
        const withResults = await Promise.all(
          allAuctions.map(async (auction) => {
            try {
              const bids = await getBids(auction.id);
              if (!Array.isArray(bids) || bids.length === 0)
                return { ...auction, winner: null, topBid: null };

              const topBid = bids.reduce((max, b) => (b.bidAmount > max.bidAmount ? b : max));
              return { ...auction, winner: topBid.user, topBid };
            } catch (e) {
              console.error('Error fetching bids for auction', auction.id, e);
              return { ...auction, winner: null, topBid: null };
            }
          })
        );

        setAuctions(withResults.filter((a) => a.topBid));
      } catch (e) {
        console.error('Error loading auctions:', e);
        toast.error(`${e.message}` || 'Error loading auctions', {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'auction-list-1',
          autoClose: false,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // subscribe to websocket events so the admin panel updates in real time
    const handleAuctionEnded = async (payload) => {
      // payload may be an object like { auctionId } or just auctionId
      const auctionId = payload && (payload.auctionId || payload.id || payload);
      if (!auctionId) return;

      // optimistically mark auction closed
      setAuctions((prev) => prev.map((a) => (a.id === auctionId ? { ...a, isActive: false } : a)));

      try {
        // fetch latest bids to hydrate winner/topBid if any
        const bids = await getBids(auctionId);
        if (Array.isArray(bids) && bids.length > 0) {
          const topBid = bids.reduce((max, b) => (b.bidAmount > max.bidAmount ? b : max));
          setAuctions((prev) =>
            prev.map((a) =>
              a.id === auctionId ? { ...a, topBid, winner: topBid.user, isActive: false } : a
            )
          );
        }

        toast.success('Auction has ended.', {
          theme: 'dark',
          draggable: true,
          draggablePercent: 60,
          autoClose: 3000,
        });
      } catch (e) {
        console.error('Error hydrating auction after end event', auctionId, e);
      }
    };

    // 'user-won' can contain more specific info; treat it similarly
    const handleUserWon = async (payload) => {
      const auctionId = payload && (payload.auctionId || payload.id || payload);
      if (!auctionId) return handleAuctionEnded(payload);
      // re-use same logic
      await handleAuctionEnded(payload);
    };

    websocketService.on('auction-ended', handleAuctionEnded);
    websocketService.on('user-won', handleUserWon);

    return () => {
      websocketService.off('auction-ended', handleAuctionEnded);
      websocketService.off('user-won', handleUserWon);
    };
  }, []);

  const handleTogglePaid = async (auctionId, currentPaid) => {
    try {
      await markAuctionPaid(auctionId, !currentPaid);

      setAuctions((prev) =>
        prev.map((x) => (x.id === auctionId ? { ...x, isPaid: !currentPaid } : x))
      );
    } catch (e) {
      console.error('Error marking auction paid');
      toast.error(`${e.message}` || 'Error marking auction paid', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-list-1',
        autoClose: false,
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  const totalOwed = auctions
    .filter((auction) => auction.winner && !auction.isPaid)
    .reduce((sum, auction) => sum + (auction.topBid?.bidAmount || 0), 0);

  const awaitingPayment = auctions.filter((auction) => !auction.isPaid).length;
  const readyToShip = auctions.filter(
    (auction) => auction.isPaid && !hasRealTracking(auction.trackingNumber)
  ).length;

  const statTiles = [
    { label: 'Results', value: auctions.length },
    { label: 'Unpaid', value: awaitingPayment, tone: awaitingPayment > 0 ? 'bad' : null },
    { label: 'To ship', value: readyToShip, tone: readyToShip > 0 ? 'wait' : null },
    { label: 'Owed', value: formatMoney(totalOwed), isOwed: true },
  ];

  return (
    <>
      <div className="slg-sales-stats">
        {statTiles.map((tile) => (
          <div
            key={tile.label}
            className={`slg-sales-stat${tile.tone ? ` slg-sales-stat--${tile.tone}` : ''}`}
          >
            <span className="slg-sales-stat-label">{tile.label}</span>
            <span
              className={`slg-sales-stat-value${tile.isOwed ? ' slg-sales-stat-value--owed' : ''}`}
            >
              {tile.value}
            </span>
          </div>
        ))}
      </div>

      <div className="slg-sales-body slg-sales-body--full">
        <main className="slg-sales-main">
          <div className="slg-sales-toolbar">
            <h2 className="slg-sales-heading">Auction results</h2>
            <p className="slg-sales-count">{auctions.length}</p>
          </div>

          {auctions.length === 0 ? (
            <p className="slg-sale-empty">
              No auctions have taken a bid yet. Results appear here once bidding starts.
            </p>
          ) : (
            <ul className="slg-sale-list">
              {auctions.map((auction) => {
                const isClosed = !auction.isActive;
                const winnerName = auction.winner
                  ? `${auction.winner.firstName || ''} ${auction.winner.lastName || ''}`.trim()
                  : '';
                const highBid = auction.topBid ? auction.topBid.bidAmount : 0;
                const image = auction.imageUrls?.[0];
                const completedStages = countCompletedStages({
                  isPaid: auction.isPaid,
                  trackingNumber: auction.trackingNumber,
                });

                return (
                  <li key={auction.id} className="slg-auction-row">
                    <button
                      type="button"
                      className="slg-auction-piece"
                      onClick={() => navigate(`/auctions/${auction.id}`)}
                    >
                      <span className="slg-sale-thumb">
                        {image ? <img src={image} alt="" /> : null}
                      </span>

                      <span className="slg-sale-identity">
                        <span className="slg-sale-title">{auction.title}</span>
                        <span className="slg-sale-buyer">
                          {isClosed ? 'Winner' : 'High bidder'}: {winnerName || 'No bids'}
                        </span>
                      </span>

                      <span className="slg-sale-price">
                        {highBid ? formatMoney(highBid) : 'No bids'}
                      </span>
                    </button>

                    <div className="slg-auction-state">
                      {isClosed ? (
                        <SaleStages completedCount={completedStages} />
                      ) : (
                        <span className="slg-auction-live">Live</span>
                      )}

                      {isClosed && (
                        <div className="slg-auction-actions">
                          <button
                            type="button"
                            className={`slg-sales-button${auction.isPaid ? '' : ' slg-sales-button--primary'}`}
                            onClick={() => handleTogglePaid(auction.id, auction.isPaid)}
                          >
                            {auction.isPaid ? 'Mark unpaid' : 'Mark paid'}
                          </button>

                          {auction.isPaid && (
                            <button
                              type="button"
                              className="slg-sales-button"
                              onClick={() => openTrackingModal(auction.id, auction.trackingNumber)}
                            >
                              {hasRealTracking(auction.trackingNumber)
                                ? `Tracking ···${String(auction.trackingNumber).slice(-4)}`
                                : 'Add tracking'}
                            </button>
                          )}

                          {hasRealTracking(auction.trackingNumber) && (
                            <a
                              className="slg-sales-button"
                              href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(
                                auction.trackingNumber
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Track with USPS
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>

      {showTrackingModal && (
        <div className="slg-modal-scrim">
          <div className="slg-modal" role="dialog" aria-modal="true">
            <div className="slg-modal-head">
              <h2 className="slg-modal-title">Add tracking</h2>
              <button
                type="button"
                className="slg-modal-close"
                onClick={() => setShowTrackingModal(false)}
                aria-label="Close tracking form"
              >
                ✕
              </button>
            </div>

            <div className="slg-user-card">
              <span className="slg-sale-fact-label">Ship to</span>
              {address ? (
                <div className="slg-sale-address">
                  <div className="slg-sale-address-lines">
                    <div>{displayName || 'Unknown'}</div>
                    <div>{address.addressLine1}</div>
                    {address.addressLine2 ? <div>{address.addressLine2}</div> : null}
                    <div>
                      {address.city}, {address.state} {address.postalCode}
                    </div>
                    <div>{address.countryCode || 'US'}</div>
                  </div>
                  <button type="button" className="slg-sales-button" onClick={copyAddressText}>
                    Copy address
                  </button>
                </div>
              ) : (
                <p className="slg-sale-fact-value slg-sale-fact-value--missing">
                  No shipping address on file
                </p>
              )}
            </div>

            <div className="slg-field">
              <label className="slg-field-label" htmlFor="slg-auction-tracking">
                USPS tracking number
              </label>
              <input
                id="slg-auction-tracking"
                type="text"
                className="slg-input"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
              />
            </div>

            <div className="slg-modal-actions">
              <button
                type="button"
                className="slg-sales-button slg-sales-button--wide"
                onClick={() => setShowTrackingModal(false)}
              >
                Cancel
              </button>
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
      )}
    </>
  );
};

export default AuctionResultsPanel;
