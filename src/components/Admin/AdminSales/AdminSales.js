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
    <div className="slg-sales">
      <div className="slg-sales-head">
        <p className="slg-eyebrow">Admin</p>
        <h1 className="slg-sales-title">Sales</h1>
      </div>

      <div className="slg-sales-tabs" role="tablist" aria-label="Sales source">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`slg-sales-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`slg-sales-view-${tab.id}`}
            className={`slg-sales-tab${activeTab === tab.id ? ' slg-sales-tab--on' : ''}`}
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
            id={`slg-sales-view-${tab.id}`}
            aria-labelledby={`slg-sales-tab-${tab.id}`}
          >
            {tab.id === 'gallery' ? <GallerySalesPanel /> : <AuctionResultsPanel />}
          </div>
        ) : null
      )}
    </div>
  );
};

export default AdminSales;
