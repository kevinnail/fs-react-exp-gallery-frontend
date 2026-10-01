const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const formatMoney = (amount) => currencyFormatter.format(amount);

const formatPercent = (ratio) => `${Math.round(ratio * 100)}%`;

const CustomerSummary = ({ summary }) => {
  const tiles = [
    {
      label: 'Gross revenue',
      value: formatMoney(summary.grossRevenue),
      detail: `${formatMoney(summary.collected)} collected, ${formatMoney(summary.outstanding)} outstanding`,
    },
    {
      label: 'Revenue, last 30 days',
      value: formatMoney(summary.revenueLast30Days),
      detail: `${formatMoney(summary.revenuePrior30Days)} the 30 days before`,
    },
    {
      label: 'Customers',
      value: summary.customerCount,
      detail: `${summary.buyerCount} buyers, ${formatPercent(summary.conversionRate)} conversion`,
    },
    {
      label: 'Repeat buyers',
      value: formatPercent(summary.repeatBuyerRate),
      detail: 'of buyers ordered more than once',
    },
    {
      label: 'Average order',
      value: formatMoney(summary.averageOrderValue),
      detail: `${formatMoney(summary.averageRevenuePerCustomer)} per customer`,
    },
    { label: 'New signups, last 30 days', value: summary.newSignupsLast30Days },
    { label: 'Reachable by email', value: summary.reachableByEmail },
  ];

  return (
    <div className="customer-summary">
      {tiles.map((tile) => (
        <div key={tile.label} className="customer-summary-tile">
          <span className="customer-summary-label">{tile.label}</span>
          <span className="customer-summary-value">{tile.value}</span>
          {tile.detail ? <span className="customer-summary-detail">{tile.detail}</span> : null}
        </div>
      ))}
    </div>
  );
};

export default CustomerSummary;
