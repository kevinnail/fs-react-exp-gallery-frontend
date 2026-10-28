import { useState } from 'react';
import './AdminSales.css';
import GallerySalesPanel from './GallerySalesPanel.js';
import AuctionResultsPanel from './AuctionResultsPanel.js';

const AdminSales = () => {
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryUnpaidCount, setGalleryUnpaidCount] = useState(0);
  const [auctionUnpaidCount, setAuctionUnpaidCount] = useState(0);

  // Both panels stay mounted so each tab's unpaid count is known while the other is showing.
  const tabs = [
    {
      id: 'gallery',
      label: 'Gallery',
      unpaidCount: galleryUnpaidCount,
      panel: <GallerySalesPanel onUnpaidCountChange={setGalleryUnpaidCount} />,
    },
    {
      id: 'auctions',
      label: 'Auction',
      unpaidCount: auctionUnpaidCount,
      panel: <AuctionResultsPanel onUnpaidCountChange={setAuctionUnpaidCount} />,
    },
  ];

  return (
    <div className="admin-sales">
      <div className="admin-sales-header">
        <p className="heading-label">Admin</p>
        <h1 className="admin-sales-title">Sales</h1>
      </div>

      <div className="admin-sales-tabs" role="tablist" aria-label="Sales source">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`admin-sales-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`admin-sales-tab-panel-${tab.id}`}
            className={`admin-sales-tab${activeTab === tab.id ? ' admin-sales-tab--selected' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.unpaidCount > 0 && (
              <span className="admin-sales-tab-unpaid-count">
                {tab.unpaidCount}
                <span className="visually-hidden"> unpaid</span>
              </span>
            )}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`admin-sales-tab-panel-${tab.id}`}
          aria-labelledby={`admin-sales-tab-${tab.id}`}
          hidden={activeTab !== tab.id}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
};

export default AdminSales;
