import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './AdminSales.css';
import GallerySalesPanel from './GallerySalesPanel.js';
import AuctionResultsPanel from './AuctionResultsPanel.js';

const AdminSales = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? 'gallery');
  const [galleryCounts, setGalleryCounts] = useState({ unpaid: 0, toShip: 0 });
  const [auctionCounts, setAuctionCounts] = useState({ unpaid: 0, toShip: 0 });

  // Both panels stay mounted so each tab's counts are known while the other is showing.
  const tabs = [
    {
      id: 'gallery',
      label: 'Gallery',
      counts: galleryCounts,
      panel: <GallerySalesPanel onCountsChange={setGalleryCounts} />,
    },
    {
      id: 'auctions',
      label: 'Auction',
      counts: auctionCounts,
      panel: <AuctionResultsPanel onCountsChange={setAuctionCounts} />,
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
            {tab.counts.unpaid > 0 && (
              <span className="admin-sales-tab-unpaid-count">
                {tab.counts.unpaid}
                <span className="visually-hidden"> unpaid</span>
              </span>
            )}
            {tab.counts.toShip > 0 && (
              <span className="admin-sales-tab-to-ship-count">
                {tab.counts.toShip}
                <span className="visually-hidden"> to ship</span>
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
