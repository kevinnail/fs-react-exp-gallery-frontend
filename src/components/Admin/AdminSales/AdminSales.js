import { useState, useEffect } from 'react';
import './AdminSales.css';

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

      // placeholder before service integration
      const salesData = [
        {
          id: 1,
          post_title: 'Fumed Sherlock Pipe',
          price: 150,
          buyer_email: 'collector1@example.com',
          image_url: 'https://via.placeholder.com/80x80?text=Pipe',
          tracking_number: '9400111899223847238497',
        },
        {
          id: 2,
          post_title: 'Blue Reticello Pendant',
          price: 85,
          buyer_email: 'glassfanatic@example.com',
          image_url: 'https://via.placeholder.com/80x80?text=Pendant',
          tracking_number: null,
        },
        {
          id: 3,
          post_title: 'Inside-Out Spoon',
          price: 60,
          buyer_email: 'newbuyer2025@example.com',
          image_url: 'https://via.placeholder.com/80x80?text=Spoon',
          tracking_number: '9405511202558394021123',
        },
        {
          id: 4,
          post_title: 'Color-Changing Chillum',
          price: 40,
          buyer_email: 'vipcollector@example.com',
          image_url: 'https://via.placeholder.com/80x80?text=Chillum',
          tracking_number: null,
        },
      ];

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
    await updateSaleTracking(selectedSale, trackingInput); // service call
    await loadSales();
  };

  // handle creating a new sale
  const handleCreateSale = async () => {
    await createSale(newBuyerEmail, newPieceId, newPrice, newTracking); // service call

    // reset inputs
    setNewBuyerEmail('');
    setNewPieceId('');
    setNewPrice('');
    setNewTracking('');

    setIsCreatingSale(false);
    await loadSales();
  };

  useEffect(() => {
    loadSales();
  }, []);

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
              <h2>All Sales</h2>

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
              ) : !selectedSale ? (
                <div className="no-sale-selected">
                  <p>Select a sale to view details</p>
                </div>
              ) : (
                <div className="sales-detail">
                  <h2>Sale Details</h2>

                  <img
                    src={sales.find((s) => s.id === selectedSale)?.image_url}
                    alt="Piece"
                    className="sales-detail-img"
                  />

                  <div className="sales-detail-row">
                    <label>Buyer:</label>
                    <span>{sales.find((s) => s.id === selectedSale)?.buyer_email}</span>
                  </div>

                  <div className="sales-detail-row">
                    <label>Piece:</label>
                    <span>{sales.find((s) => s.id === selectedSale)?.post_title}</span>
                  </div>

                  <div className="sales-detail-row">
                    <label>Price:</label>
                    <span>${sales.find((s) => s.id === selectedSale)?.price}</span>
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

                  <button className="save-tracking-button" onClick={handleSaveTracking}>
                    Save Tracking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// service functions to implement later:
async function getAllSales() {}
async function createSale(email, postId, price, tracking) {}
async function updateSaleTracking(saleId, tracking) {}
