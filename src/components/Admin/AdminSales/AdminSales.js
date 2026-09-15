import { useState } from 'react';
import './AdminSales.css';
import GallerySalesPanel from './GallerySalesPanel.js';
import AuctionResultsPanel from './AuctionResultsPanel.js';

const TABS = [
  { id: 'gallery', label: 'Gallery' },
  { id: 'auctions', label: 'Auction' },
];

const AdminSales = () => {
  const [activeTab, setActiveTab] = useState('gallery');

  return (
    <div className="admin-sales">
      <div className="admin-sales-header">
        <p className="heading-label">Admin</p>
        <h1 className="admin-sales-title">Sales</h1>
      </div>

      <div className="admin-sales-tabs" role="tablist" aria-label="Sales source">
        {TABS.map((tab) => (
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
          </button>
        ))}
      </div>

      {TABS.map((tab) =>
        activeTab === tab.id ? (
          <div
            key={tab.id}
            role="tabpanel"
            id={`admin-sales-tab-panel-${tab.id}`}
            aria-labelledby={`admin-sales-tab-${tab.id}`}
          >
            {tab.id === 'gallery' ? <GallerySalesPanel /> : <AuctionResultsPanel />}
          </div>
        ) : null
      )}
    </div>
  );
};

export default AdminSales;
