import { useState, useEffect } from 'react';
import './AdminSales.css';
import {
  getAllSales,
  createSale,
  updateSaleTracking,
  updateSalePaidStatus,
} from '../../../services/fetch-sales.js';

export default function AdminSales() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingSale, setIsCreatingSale] = useState(false);

  // state for creating a sale
  const [newBuyerEmail, setNewBuyerEmail] = useState('');
  const [newPieceId, setNewPieceId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newTracking, setNewTracking] = useState('');

  // state for editing tracking on existing sale
  const [trackingInput, setTrackingInput] = useState('');

  const loadSales = async () => {
    try {
      setLoading(true);

      const salesData = await getAllSales();
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
    await updateSaleTracking(selectedSale, trackingInput);
    await loadSales();
  };

  // handle creating a new sale
  const handleCreateSale = async () => {
    await createSale(newBuyerEmail, newPieceId, newPrice, newTracking);

    // reset inputs
    setNewBuyerEmail('');
    setNewPieceId('');
    setNewPrice('');
    setNewTracking('');

    setIsCreatingSale(false);
    await loadSales();
  };

  const handleTrackingClick = (trackingNumber) => {
    if (!trackingNumber) return;
    const url = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    loadSales();
  }, []);

  // the one new refactor line
  const currentSale = selectedSale ? sales.find((s) => s.id === selectedSale) : null;

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
                      style={{ border: !sale.is_paid && '1px solid yellow' }}
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
                            {sale.buyer_last_name.length > 30
                              ? sale.buyer_last_name.slice(0, 4) + '...'
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

                  <div className="sales-detail-row">
                    <label>Buyer Email:</label>
                    <input
                      type="text"
                      className="tracking-input"
                      value={newBuyerEmail}
                      onChange={(e) => setNewBuyerEmail(e.target.value)}
                    />
                  </div>

                  <div className="sales-detail-row">
                    <label>Piece ID:</label>
                    <input
                      type="number"
                      className="tracking-input"
                      value={newPieceId}
                      onChange={(e) => setNewPieceId(e.target.value)}
                    />
                  </div>

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
                    <div className="tracking-link">
                      <a
                        href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(
                          currentSale.tracking_number
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View tracking for ${currentSale.post_title}`}
                      >
                        <img
                          alt="USPS"
                          className="auction-result-thumb"
                          style={{ width: '50px', height: '50px', margin: '.5rem 0 0 .25rem' }}
                          src="../../../usps.png"
                        />
                      </a>

                      <p
                        style={{ textAlign: 'left' }}
                        onClick={() => handleTrackingClick(currentSale.tracking_number)}
                      >
                        <span style={{ display: 'block', position: 'relative', right: '50%' }}>
                          Tracking number:
                        </span>
                        <span style={{ display: 'block' }}>{currentSale.tracking_number}</span>
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
                      style={{ backgroundColor: currentSale.is_paid ? 'green' : 'yellow' }}
                      onClick={async () => {
                        await updateSalePaidStatus(currentSale.id, !currentSale.is_paid);
                        await loadSales();
                      }}
                    >
                      {currentSale.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                    </button>
                  </div>

                  <div className="sales-detail-row">
                    <label>Buyer:</label>
                    <span>{currentSale.buyer_first_name}</span>
                    <span>{currentSale.buyer_last_name.slice(0, 1)}.</span>
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
