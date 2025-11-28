import { useEffect, useMemo, useState } from 'react';
import { getUserAuctions } from '../../../services/fetch-auctions.js';
import { getUserSales } from '../../../services/fetch-sales.js';
import { useNavigate } from 'react-router-dom';
import './PaymentDueSummary.css';

export default function PaymentDueSummary({ userId }) {
  const [wonAuctions, setWonAuctions] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedCashApp, setCopiedCashApp] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        let auctionsResp = { wonAuctions: [] };
        if (userId) {
          auctionsResp = await getUserAuctions(userId);
        }

        const salesResp = await getUserSales();

        if (!isMounted) return;

        let rawWon = [];
        if (auctionsResp && Array.isArray(auctionsResp.wonAuctions)) {
          rawWon = auctionsResp.wonAuctions;
        }

        let rawSales = [];
        if (Array.isArray(salesResp)) {
          rawSales = salesResp;
        }

        setWonAuctions(rawWon);
        setSales(rawSales);
      } catch (e) {
        console.error('Error loading payment due data:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const unpaidData = useMemo(() => {
    const unpaidWins = wonAuctions.filter((a) => !a.isPaid);
    const unpaidPurchases = sales.filter((s) => !s.is_paid);

    const auctionSubtotal = unpaidWins.reduce((sum, a) => sum + (a.finalBid || 0), 0);
    const purchaseSubtotal = unpaidPurchases.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

    const itemCount = unpaidWins.length + unpaidPurchases.length;
    let shipping = 0;
    if (itemCount > 0) {
      shipping = 9 + Math.max(0, itemCount - 1) * 1;
    }
    const total = auctionSubtotal + purchaseSubtotal + shipping;

    return {
      unpaidWins,
      unpaidPurchases,
      auctionSubtotal,
      purchaseSubtotal,
      itemCount,
      shipping,
      total,
    };
  }, [wonAuctions, sales]);

  if (loading) return null;

  const hasUnpaid = unpaidData.unpaidWins.length > 0 || unpaidData.unpaidPurchases.length > 0;
  if (!hasUnpaid) return null;

  const handleMsgNav = () => {
    navigate('/messages');
  };

  const VENMO_URL = process.env.REACT_APP_VENMO_URL;
  const VENMO_HANDLE = process.env.REACT_APP_VENMO_HANDLE;
  const CASHAPP_HANDLE = process.env.REACT_APP_CASHAPP_HANDLE;
  const ZELLE_HANDLE = process.env.REACT_APP_ZELLE_HANDLE;
  const ZELLE_NAME = process.env.REACT_APP_ZELLE_NAME;

  const handleCopyZelle = () => {
    let text = '';
    if (ZELLE_NAME) {
      text = `${ZELLE_NAME} — ${ZELLE_HANDLE}`;
    } else {
      text = `${ZELLE_HANDLE}`;
    }
    try {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.clipboard) {
        window.navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }
    } catch (e) {
      // no-op; clipboard not available
    }
  };

  const handlePrintInvoice = () => {
    const win = window.open('', '_blank');
    const date = new Date().toLocaleDateString();

    // Build a combined rows list preserving order: auctions then purchases
    const rows = [];
    unpaidData.unpaidWins.forEach((a) => {
      let date = null;
      if (a.closedAt) {
        date = new Date(a.closedAt);
      }
      rows.push({
        type: 'Auction',
        label: a.title || `Auction #${a.auctionId}`,
        amount: Number(a.finalBid) || 0,
        date,
      });
    });

    unpaidData.unpaidPurchases.forEach((s) => {
      let date = null;
      if (s.created_at) {
        date = new Date(s.created_at);
      }
      rows.push({
        type: 'Purchase',
        label: s.post_title || `Post #${s.post_id}`,
        amount: Number(s.price) || 0,
        date,
      });
    });

    // Compute per-item shipping allocation: first $9, rest $1
    const shippingPerItem = [];
    for (let i = 0; i < rows.length; i += 1) {
      if (i === 0) {
        shippingPerItem.push(9);
      } else {
        shippingPerItem.push(1);
      }
    }

    const tableRowsHtml = rows
      .map((r, i) => {
        const ship = shippingPerItem[i] || 0;
        let dateStr = '';
        if (r.date) {
          dateStr = r.date.toLocaleString([], {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
        }
        return `<tr><td>${r.type}</td><td>${r.label}</td><td>$${r.amount.toLocaleString()}</td><td>${dateStr}</td><td>$${ship.toFixed(2)}</td></tr>`;
      })
      .join('');

    const invoiceHTML =
      '<html>' +
      '<head>' +
      '<title>Invoice - Stress Less Glass</title>' +
      '<style>' +
      'body { font-family: Arial, sans-serif; margin: 40px; color: #333; }' +
      'h1, h2 { text-align: left; }' +
      'table { width: 100%; border-collapse: collapse; margin-top: 20px; }' +
      'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: .9rem }' +
      'th { background: #f4f4f4; }' +
      '.totals { text-align: right; margin-top: 30px; margin-right: 3rem; width: 20%; justify-self: flex-end }' +
      '.totals p { margin: 0; }' +
      '.footer { margin-top: 40px; text-align: center; font-size: 0.9em; }' +
      '</style>' +
      '</head>' +
      '<body>' +
      '<h1>Stress Less Glass</h1>' +
      '<h2>Invoice</h2>' +
      `<p><strong>Date:</strong> ${date}</p>` +
      '<table>' +
      '<thead><tr><th>Type</th><th>Item</th><th>Amount</th><th>Date</th><th>Shipping</th></tr></thead>' +
      `<tbody>${tableRowsHtml}</tbody>` +
      '</table>' +
      `<div class="totals" style="margin-top:30px;">` +
      `<div style="display:flex; justify-content:space-between; margin:4px 0;">` +
      `<p><strong>Auctions Subtotal:</strong></p>` +
      `<p>$${unpaidData.auctionSubtotal.toLocaleString()}</p>` +
      `</div>` +
      `<div style="display:flex; justify-content:space-between; margin:4px 0;">` +
      `<p><strong>Purchases Subtotal:</strong></p>` +
      `<p>$${unpaidData.purchaseSubtotal.toLocaleString()}</p>` +
      `</div>` +
      `<div style="display:flex; justify-content:space-between; margin:4px 0;">` +
      `<p><strong>Shipping:</strong></p>` +
      `<p>$${unpaidData.shipping.toLocaleString()}</p>` +
      `</div>` +
      `<div style="display:flex; justify-content:space-between; margin-top:8px; font-size:1.1rem;">` +
      `<p><strong>Total:</strong></p>` +
      `<p><strong>$${unpaidData.total.toLocaleString()}</strong></p>` +
      `</div>` +
      `</div>` +
      '<div class="footer">' +
      '<p>Payment Due!</p>' +
      '<p>Zelle, Venmo, or Cash App.</p>' +
      '<p>Thank you for supporting Stress Less Glass!</p>' +
      '</div>' +
      '<script>window.onload = () => window.print();</script>' +
      '</body>' +
      '</html>';

    win.document.write(invoiceHTML);
    win.document.close();
  };

  return (
    <div className="payment-due-summary">
      <div className="user-auctions-summary">
        <h4>Payment needed (combined)</h4>
        <div className="summary-details">
          <p className="summary-details-p">
            <span>Auctions unpaid:</span> {unpaidData.unpaidWins.length}
          </p>
          <p className="summary-details-p">
            <span>Purchases unpaid:</span> {unpaidData.unpaidPurchases.length}
          </p>
          <p className="summary-details-p">
            <span>Auctions subtotal:</span> ${unpaidData.auctionSubtotal.toLocaleString()}
          </p>
          <p className="summary-details-p">
            <span>Purchases subtotal:</span> ${unpaidData.purchaseSubtotal.toLocaleString()}
          </p>
          <p className="summary-details-p">
            <span>Shipping:</span> ${unpaidData.shipping.toLocaleString()}
          </p>
          <p className="summary-total">
            <strong>Total:</strong> ${unpaidData.total.toLocaleString()}
          </p>
        </div>

        <div className="payment-info-banner">
          <div className="payment-due">
            <strong>Payment Due!</strong>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="pay-now-btn"
                onClick={handlePrintInvoice}
                style={{ cursor: 'pointer' }}
              >
                Print invoice
              </button>
            </div>
          </div>

          <p>
            Contact me through{' '}
            <span onClick={handleMsgNav} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Messages
            </span>
            {` `}if you have any questions or problems!
          </p>

          {/* Quick Pay options as cards */}
          <div className="quick-pay-section">
            <div className="quick-pay-header">Easy Pay Options</div>

            {/* Zelle Card */}
            <div className="quick-pay-card zelle">
              <div className="quick-pay-thumb" aria-hidden>
                Z
              </div>
              <div className="quick-pay-content">
                <div className="quick-pay-title">
                  Zelle{' '}
                  <span style={{ fontWeight: '300' }}>
                    {ZELLE_NAME} - {ZELLE_HANDLE}
                  </span>
                </div>

                <div className="quick-pay-subtitle">
                  Preferred — instant & always free (available at most banks)
                </div>
                <div className="quick-pay-row">
                  <button className="pay-now-btn" onClick={handleCopyZelle}>
                    Copy Zelle info
                  </button>
                  {copied ? <span className="copied-indicator">Copied!</span> : null}
                </div>
              </div>
            </div>

            {/* Venmo Card */}
            <div className="quick-pay-card venmo">
              <div className="quick-pay-thumb" aria-hidden>
                V
              </div>
              <div className="quick-pay-content">
                <div className="quick-pay-title">
                  Venmo
                  <span style={{ fontWeight: '300' }}>
                    {`  `}
                    {VENMO_HANDLE}
                  </span>
                </div>
                <div className="quick-pay-row">
                  <a
                    className="pay-now-btn"
                    style={{
                      textDecoration: 'none',
                      fontSize: '.9rem',
                      padding: '2px ',
                      minWidth: '120px',
                      textAlign: 'center',
                    }}
                    href={VENMO_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Pay via Venmo
                  </a>
                </div>
              </div>
            </div>

            {/* Cash App Card */}
            <div className="quick-pay-card cashapp">
              <div className="quick-pay-thumb" aria-hidden>
                $
              </div>
              <div className="quick-pay-content">
                <div className="quick-pay-title">
                  Cash App
                  <span style={{ fontWeight: '300' }}>
                    {`  `}${CASHAPP_HANDLE}
                  </span>
                </div>
                <div className="quick-pay-row">
                  <button
                    className="pay-now-btn"
                    onClick={() => {
                      if (
                        typeof window !== 'undefined' &&
                        window.navigator &&
                        window.navigator.clipboard
                      ) {
                        window.navigator.clipboard.writeText(CASHAPP_HANDLE).then(() => {
                          setCopiedCashApp(true);
                          setTimeout(() => setCopiedCashApp(false), 1500);
                        });
                      }
                    }}
                  >
                    Copy Cash App
                  </button>
                  {copiedCashApp ? <span className="copied-indicator">Copied!</span> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
