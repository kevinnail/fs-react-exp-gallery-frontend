import { useState } from 'react';
import './AdminSales.css';
import GallerySalesPanel from './GallerySalesPanel.js';
import AuctionResultsPanel from './AuctionResultsPanel.js';

export default function AdminSales() {
  const [activeTab, setActiveTab] = useState('gallery');

  return (
    <div className="admin-sales-wrapper">
      <h2 style={{ margin: '0.25rem', textAlign: 'center' }}>Sales</h2>
      <div className="admin-sales-tabs">
        <button
          className={activeTab === 'gallery' ? 'active' : ''}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery
        </button>

        <button
          className={activeTab === 'auctions' ? 'active' : ''}
          onClick={() => setActiveTab('auctions')}
        >
          Auction
        </button>
      </div>

      <div className="admin-sales-tab-content">
        {activeTab === 'gallery' && <GallerySalesPanel />}
        {activeTab === 'auctions' && <AuctionResultsPanel />}
      </div>
    </div>
  );
}
