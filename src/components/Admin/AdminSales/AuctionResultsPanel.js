import { useEffect, useRef, useState } from 'react';
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

const getAuctionWinner = (auction) => {
  if (!auction) return null;
  if (auction.winner) return auction.winner;
  if (auction.topBid && auction.topBid.user) return auction.topBid.user;
  return null;
};

const getWinnerName = (winner) => `${winner?.firstName || ''} ${winner?.lastName || ''}`.trim();

const findWinnerAccount = (users, winner) => {
  if (!winner) return null;
  return (
    users.find((user) => {
      const winnerUserId = winner.userId || winner.id;
      if (winnerUserId && Number(user.id) === Number(winnerUserId)) return true;
      if (
        winner.email &&
        (user.email || user.user_email || '').toLowerCase() === winner.email.toLowerCase()
      ) {
        return true;
      }
      return false;
    }) || null
  );
};

const buildTrackingUrl = (trackingNumber) =>
  `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`;

const AuctionResultsPanel = () => {
  const [auctions, setAuctions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  const navigate = useNavigate();
  const auctionPanelRef = useRef(null);

  const lastBidUpdate = useAuctionEventsStore((state) => state.lastBidUpdate);

  useEffect(() => {
    if (!lastBidUpdate) return;
    const auctionId = Number(lastBidUpdate.id);

    (async () => {
      try {
        const bids = await getBids(auctionId);
        if (Array.isArray(bids) && bids.length > 0) {
          const topBid = bids.reduce((highest, bid) =>
            bid.bidAmount > highest.bidAmount ? bid : highest
          );
          setAuctions((previous) =>
            previous.map((auction) =>
              Number(auction.id) === auctionId
                ? { ...auction, topBid, winner: topBid.user }
                : auction
            )
          );
        }
      } catch (error) {
        console.error('Error updating admin high bid:', error);
      }
    })();
  }, [lastBidUpdate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allAuctions = await getAdminAuctions();
        const allUsers = await getAllUsers();
        setUsers(Array.isArray(allUsers) ? allUsers : []);

        // hydrate each auction with top bid + bidder if available
        const withResults = await Promise.all(
          allAuctions.map(async (auction) => {
            try {
              const bids = await getBids(auction.id);
              if (!Array.isArray(bids) || bids.length === 0)
                return { ...auction, winner: null, topBid: null };

              const topBid = bids.reduce((highest, bid) =>
                bid.bidAmount > highest.bidAmount ? bid : highest
              );
              return { ...auction, winner: topBid.user, topBid };
            } catch (error) {
              console.error('Error fetching bids for auction', auction.id, error);
              return { ...auction, winner: null, topBid: null };
            }
          })
        );

        setAuctions(withResults.filter((auction) => auction.topBid));
      } catch (error) {
        console.error('Error loading auctions:', error);
        toast.error(`${error.message}` || 'Error loading auctions', {
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
      setAuctions((previous) =>
        previous.map((auction) =>
          auction.id === auctionId ? { ...auction, isActive: false } : auction
        )
      );

      try {
        // fetch latest bids to hydrate winner/topBid if any
        const bids = await getBids(auctionId);
        if (Array.isArray(bids) && bids.length > 0) {
          const topBid = bids.reduce((highest, bid) =>
            bid.bidAmount > highest.bidAmount ? bid : highest
          );
          setAuctions((previous) =>
            previous.map((auction) =>
              auction.id === auctionId
                ? { ...auction, topBid, winner: topBid.user, isActive: false }
                : auction
            )
          );
        }

        toast.success('Auction has ended.', {
          theme: 'dark',
          draggable: true,
          draggablePercent: 60,
          autoClose: 3000,
        });
      } catch (error) {
        console.error('Error hydrating auction after end event', auctionId, error);
      }
    };

    // 'user-won' can contain more specific info; treat it similarly
    const handleUserWon = async (payload) => {
      await handleAuctionEnded(payload);
    };

    websocketService.on('auction-ended', handleAuctionEnded);
    websocketService.on('user-won', handleUserWon);

    return () => {
      websocketService.off('auction-ended', handleAuctionEnded);
      websocketService.off('user-won', handleUserWon);
    };
  }, []);

  const currentAuction = selectedAuctionId
    ? auctions.find((auction) => auction.id === selectedAuctionId) || null
    : null;

  const currentWinner = getAuctionWinner(currentAuction);
  const currentWinnerAccount = findWinnerAccount(users, currentWinner);
  const currentAddress = currentWinnerAccount?.address || null;
  const currentWinnerProfile = currentWinnerAccount?.profile || {};
  const currentWinnerName = `${currentWinnerProfile.firstName || currentWinner?.firstName || ''} ${
    currentWinnerProfile.lastName || currentWinner?.lastName || ''
  }`.trim();
  const currentWinnerEmail =
    currentWinner?.email || currentWinnerAccount?.email || currentWinnerAccount?.user_email || '';

  const revealDetailPanel = () => {
    if (window.matchMedia('(min-width: 1100px)').matches) return;
    requestAnimationFrame(() => {
      auctionPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSelectAuction = (auctionId) => {
    setSelectedAuctionId(auctionId);

    const auction = auctions.find((candidate) => candidate.id === auctionId);
    if (auction) {
      setTrackingInput(hasRealTracking(auction.trackingNumber) ? auction.trackingNumber : '');
    }

    revealDetailPanel();
  };

  const copyAddressText = () => {
    if (!currentAddress) {
      toast.error('No address on file to copy.', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-copy-no-address',
        autoClose: 3500,
      });
      return;
    }

    const countryCode = (currentAddress.countryCode || 'US').toUpperCase();
    const lines = [
      currentWinnerName || currentWinnerEmail,
      currentAddress.addressLine1,
      currentAddress.addressLine2,
      `${currentAddress.city}, ${currentAddress.state} ${currentAddress.postalCode}`,
      countryCode !== 'US' ? countryCode : null,
    ].filter(Boolean);
    const text = lines.join('\n');

    const onSuccess = () => {
      toast.success('Address copied', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-tracking-copy-address',
        autoClose: 2000,
      });
    };
    const onFail = () => {
      toast.error('Failed to copy address', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-tracking-copy-address',
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
        const holder = document.createElement('textarea');
        holder.value = text;
        holder.readOnly = true;
        holder.style.position = 'fixed';
        holder.style.top = '-1000px';
        document.body.appendChild(holder);
        holder.select();
        toast.info('Clipboard not available. Press Ctrl+C to copy.', {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'auction-tracking-copy-address',
          autoClose: 3500,
        });
        setTimeout(() => {
          document.body.removeChild(holder);
        }, 4000);
      } catch (error) {
        onFail();
      }
    }
  };

  const handleSaveTracking = async () => {
    try {
      await updateAuctionTracking(selectedAuctionId, trackingInput.trim());

      setAuctions((previous) =>
        previous.map((auction) =>
          auction.id === selectedAuctionId
            ? { ...auction, trackingNumber: trackingInput.trim() }
            : auction
        )
      );

      toast.success('Tracking saved and email sent!', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-track-fail',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error(`${error.message}` || 'Error saving tracking', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-track-fail',
        autoClose: 3000,
      });
    }
  };

  const handleTogglePaid = async () => {
    if (!currentAuction) return;
    const currentPaid = currentAuction.isPaid;
    try {
      await markAuctionPaid(currentAuction.id, !currentPaid);

      setAuctions((previous) =>
        previous.map((auction) =>
          auction.id === currentAuction.id ? { ...auction, isPaid: !currentPaid } : auction
        )
      );
    } catch (error) {
      console.error('Error marking auction paid');
      toast.error(`${error.message}` || 'Error marking auction paid', {
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

  const currentAuctionClosed = currentAuction ? !currentAuction.isActive : false;
  const currentAuctionStages = currentAuction
    ? countCompletedStages({
        isPaid: currentAuction.isPaid,
        trackingNumber: currentAuction.trackingNumber,
      })
    : 1;

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
            <span
              className={`slg-sales-stat-value${tile.isOwed ? ' slg-sales-stat-value--owed' : ''}`}
            >
              {tile.value}
            </span>
          </div>
        ))}
      </div>

      <div className="slg-sales-body">
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
                const winnerName = getWinnerName(getAuctionWinner(auction));
                const highBid = auction.topBid ? auction.topBid.bidAmount : 0;
                const image = auction.imageUrls?.[0];
                const completedStages = countCompletedStages({
                  isPaid: auction.isPaid,
                  trackingNumber: auction.trackingNumber,
                });

                return (
                  <li key={auction.id}>
                    <button
                      type="button"
                      className={`slg-sale-row${selectedAuctionId === auction.id ? ' slg-sale-row--on' : ''}`}
                      aria-pressed={selectedAuctionId === auction.id}
                      onClick={() => handleSelectAuction(auction.id)}
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

                      {isClosed ? (
                        <SaleStages completedCount={completedStages} />
                      ) : (
                        <span className="slg-stages slg-auction-live">Live</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </main>

        <aside className="slg-sales-rail" ref={auctionPanelRef}>
          {!currentAuction ? (
            <div className="slg-sale-panel">
              <div className="slg-sale-panel-head">
                <h2 className="slg-sale-panel-title">Auction detail</h2>
              </div>
              <p className="slg-sale-placeholder">
                Pick an auction to see the winner, the address, and where it is in the pipeline.
              </p>
            </div>
          ) : (
            <div className="slg-sale-panel">
              <div className="slg-sale-panel-head">
                <h2 className="slg-sale-panel-title">Auction detail</h2>
                <button
                  type="button"
                  className="slg-sales-button"
                  onClick={() => setSelectedAuctionId(null)}
                >
                  Close
                </button>
              </div>

              <div className="slg-sale-panel-body">
                {currentAuctionClosed ? (
                  <SaleStages completedCount={currentAuctionStages} variant="detail" />
                ) : (
                  <p className="slg-auction-live slg-auction-live--detail">Live bidding</p>
                )}

                <div className="slg-sale-piece">
                  {currentAuction.imageUrls?.[0] ? (
                    <img
                      src={currentAuction.imageUrls[0]}
                      alt=""
                      className="slg-sale-piece-image"
                    />
                  ) : (
                    <span className="slg-sale-piece-image" aria-hidden="true" />
                  )}
                  <div className="slg-sale-piece-meta">
                    <h3 className="slg-sale-piece-title">{currentAuction.title}</h3>
                    <span className="slg-sale-piece-price">
                      {currentAuction.topBid
                        ? formatMoney(currentAuction.topBid.bidAmount)
                        : 'No bids'}
                    </span>
                  </div>
                </div>

                <div className="slg-sale-actions">
                  <button
                    type="button"
                    className="slg-sales-button slg-sales-button--wide"
                    onClick={() => navigate(`/auctions/${currentAuction.id}`)}
                  >
                    View auction
                  </button>
                </div>

                {currentAuctionClosed && (
                  <div className="slg-sale-actions">
                    <button
                      type="button"
                      className={`slg-sales-button slg-sales-button--wide${
                        currentAuction.isPaid ? '' : ' slg-sales-button--primary'
                      }`}
                      onClick={handleTogglePaid}
                    >
                      {currentAuction.isPaid ? 'Mark unpaid' : 'Mark paid'}
                    </button>
                  </div>
                )}

                <dl className="slg-sale-facts">
                  <div className="slg-sale-fact">
                    <dt className="slg-sale-fact-label">
                      {currentAuctionClosed ? 'Winner' : 'High bidder'}
                    </dt>
                    <dd className="slg-sale-fact-value">{currentWinnerName || 'No bids'}</dd>
                  </div>

                  <div className="slg-sale-fact">
                    <dt className="slg-sale-fact-label">Email</dt>
                    <dd className="slg-sale-fact-value">
                      {currentWinnerEmail || (
                        <span className="slg-sale-fact-value--missing">No email on file</span>
                      )}
                    </dd>
                  </div>

                  <div className="slg-sale-fact">
                    <dt className="slg-sale-fact-label">Ship to</dt>
                    <dd className="slg-sale-fact-value">
                      {currentAddress ? (
                        <div className="slg-sale-address">
                          {renderAddressLines(currentAddress)}
                          <button
                            type="button"
                            className="slg-sales-button"
                            onClick={copyAddressText}
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

                {hasRealTracking(currentAuction.trackingNumber) && (
                  <a
                    className="slg-sale-tracking-link"
                    href={buildTrackingUrl(currentAuction.trackingNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img alt="" className="slg-sale-tracking-mark" src="../../../usps.png" />
                    <span className="slg-sale-tracking-text">
                      <span className="slg-sale-tracking-caption">Track with USPS</span>
                      <span className="slg-sale-tracking-number">
                        {currentAuction.trackingNumber}
                      </span>
                    </span>
                  </a>
                )}

                <div className="slg-field">
                  <label className="slg-field-label" htmlFor="slg-auction-tracking">
                    Tracking number
                  </label>
                  <input
                    id="slg-auction-tracking"
                    type="text"
                    className="slg-input"
                    value={trackingInput}
                    onChange={(event) => setTrackingInput(event.target.value)}
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
          )}
        </aside>
      </div>
    </>
  );
};

export default AuctionResultsPanel;
