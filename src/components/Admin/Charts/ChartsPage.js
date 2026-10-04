import { useEffect, useMemo, useRef, useState } from 'react';
import { getChartSeries } from '../../../services/fetch-chart-series.js';
import { classifyTrend } from '../../../services/trendVerdict.js';
import {
  formatCount,
  formatDays,
  formatMoney,
  formatMultiple,
  formatOneDecimal,
  formatPercent,
} from './chartFormat.js';
import MetricCard from './MetricCard.js';
import MetricDetailChart from './MetricDetailChart.js';
import './ChartsPage.css';

const GRANULARITY_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const RANGE_OPTIONS = [
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
];

// Below these averages, one sale after a quiet stretch would read as a huge jump.
const REVENUE_MINIMUM_BASELINE = 100;
const COUNT_MINIMUM_BASELINE = 2;

const buildSections = ({
  galleryRevenue,
  auctionRevenue,
  orderCount,
  itemsSold,
  signups,
  firstTimeBuyers,
  returningBuyerOrders,
  conversionRate,
  piecesPosted,
  piecesSold,
  medianDaysToSell,
  auctionsClosed,
  auctionSellThrough,
  buyNowShare,
  finalOverStart,
  bidsPerAuction,
  uniqueBidders,
}) => {
  const galleryPart = { label: 'Gallery', values: galleryRevenue, colorToken: '--color-accent' };
  const auctionPart = { label: 'Auction', values: auctionRevenue, colorToken: '--color-info' };
  const totalRevenue = galleryRevenue.map((value, index) => value + auctionRevenue[index]);
  // Derived here rather than sent by the server so it can never disagree with
  // revenue and order count. A period with no orders has no average.
  const averageOrderValue = totalRevenue.map((revenue, index) =>
    orderCount[index] === 0 ? null : revenue / orderCount[index]
  );

  const singleSeries = (label, values) => [{ label, values, colorToken: '--color-accent' }];

  const revenueMetrics = [
    {
      key: 'totalRevenue',
      name: 'Total revenue',
      values: totalRevenue,
      parts: [galleryPart, auctionPart],
    },
    {
      key: 'galleryRevenue',
      name: 'Gallery revenue',
      values: galleryRevenue,
      parts: [galleryPart],
    },
    {
      key: 'auctionRevenue',
      name: 'Auction revenue',
      values: auctionRevenue,
      parts: [auctionPart],
    },
  ].map((metric) => ({
    ...metric,
    formatValue: formatMoney,
    trendOptions: { minimumBaseline: REVENUE_MINIMUM_BASELINE },
  }));

  const countMetric = (key, name, values) => ({
    key,
    name,
    values,
    parts: singleSeries(name, values),
    formatValue: formatCount,
    wholeNumbers: true,
    trendOptions: { minimumBaseline: COUNT_MINIMUM_BASELINE },
  });

  const ordersAndCustomersMetrics = [
    countMetric('orderCount', 'Orders', orderCount),
    countMetric('itemsSold', 'Items sold', itemsSold),
    {
      key: 'averageOrderValue',
      name: 'Average order',
      values: averageOrderValue,
      parts: singleSeries('Average order', averageOrderValue),
      formatValue: formatMoney,
      trendOptions: {},
    },
    countMetric('signups', 'Signups', signups),
    countMetric('firstTimeBuyers', 'First-time buyers', firstTimeBuyers),
    countMetric('returningBuyerOrders', 'Returning-buyer orders', returningBuyerOrders),
    {
      key: 'conversionRate',
      name: 'Conversion rate',
      values: conversionRate,
      parts: singleSeries('Conversion rate', conversionRate),
      formatValue: formatPercent,
      trendOptions: {},
    },
  ];

  const galleryMetrics = [
    countMetric('piecesPosted', 'Pieces posted', piecesPosted),
    countMetric('piecesSold', 'Pieces sold', piecesSold),
    {
      key: 'medianDaysToSell',
      name: 'Median days to sell',
      values: medianDaysToSell,
      parts: singleSeries('Median days to sell', medianDaysToSell),
      formatValue: formatDays,
      trendOptions: { higherIsBetter: false },
    },
  ];

  const ratioMetric = (key, name, values, formatValue) => ({
    key,
    name,
    values,
    parts: singleSeries(name, values),
    formatValue,
    trendOptions: {},
  });

  const auctionMetrics = [
    countMetric('auctionsClosed', 'Auctions closed', auctionsClosed),
    ratioMetric('auctionSellThrough', 'Sell-through', auctionSellThrough, formatPercent),
    ratioMetric('buyNowShare', 'Buy-now share', buyNowShare, formatPercent),
    ratioMetric('finalOverStart', 'Final bid over start price', finalOverStart, formatMultiple),
    ratioMetric('bidsPerAuction', 'Bids per auction', bidsPerAuction, formatOneDecimal),
    countMetric('uniqueBidders', 'Unique bidders', uniqueBidders),
  ];

  return [
    { heading: 'Revenue', metrics: revenueMetrics },
    { heading: 'Orders and customers', metrics: ordersAndCustomersMetrics },
    { heading: 'Gallery', metrics: galleryMetrics },
    { heading: 'Auctions', metrics: auctionMetrics },
  ];
};

const ChartsPage = () => {
  const [granularity, setGranularity] = useState('week');
  const [range, setRange] = useState('6m');
  const [chartSeries, setChartSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSectionHeading, setSelectedSectionHeading] = useState('Revenue');
  const [selectedMetricKey, setSelectedMetricKey] = useState('totalRevenue');
  const tabRefs = useRef([]);

  useEffect(() => {
    // A slower earlier request must not overwrite the one for the current controls.
    let isCurrentRequest = true;

    const loadChartSeries = async () => {
      setLoading(true);
      setError('');
      try {
        const loadedSeries = await getChartSeries({ granularity, range });
        if (isCurrentRequest) setChartSeries(loadedSeries);
      } catch (loadError) {
        if (isCurrentRequest) setError(loadError.message);
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };
    loadChartSeries();

    return () => {
      isCurrentRequest = false;
    };
  }, [granularity, range]);

  const sections = useMemo(() => {
    if (!chartSeries) return [];
    return buildSections(chartSeries.series).map((section) => ({
      ...section,
      metrics: section.metrics.map((metric) => ({
        ...metric,
        trend: classifyTrend(metric.values, {
          ...metric.trendOptions,
          lastPeriodIsPartial: chartSeries.currentBucketIsPartial,
        }),
      })),
    }));
  }, [chartSeries]);

  const selectedSection = sections.find((section) => section.heading === selectedSectionHeading);
  const selectedMetric = selectedSection?.metrics.find(
    (metric) => metric.key === selectedMetricKey
  );

  const selectSection = (section) => {
    setSelectedSectionHeading(section.heading);
    setSelectedMetricKey(section.metrics[0].key);
  };

  // Left and right arrows move between tabs, per the WAI-ARIA tabs pattern.
  const handleTabKeyDown = (event, index) => {
    const steps = { ArrowRight: 1, ArrowLeft: -1 };
    if (!(event.key in steps)) return;
    event.preventDefault();
    const nextIndex = (index + steps[event.key] + sections.length) % sections.length;
    selectSection(sections[nextIndex]);
    tabRefs.current[nextIndex].focus();
  };

  const lastCompleteBucket =
    chartSeries && chartSeries.buckets.length > 1 ? chartSeries.buckets.at(-2) : null;

  const renderContent = () => {
    if (error) return <p className="charts-error">{error}</p>;
    if (!chartSeries) return <p className="charts-loading">Loading charts</p>;

    return (
      <>
        <div className="charts-tabs" role="tablist" aria-label="Chart sections">
          {sections.map((section, index) => (
            <button
              key={section.heading}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`charts-tab-${index}`}
              type="button"
              role="tab"
              className="charts-tab"
              aria-selected={section === selectedSection}
              aria-controls="charts-tab-panel"
              tabIndex={section === selectedSection ? 0 : -1}
              onClick={() => selectSection(section)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {section.heading}
            </button>
          ))}
        </div>
        {selectedSection ? (
          <section
            id="charts-tab-panel"
            role="tabpanel"
            aria-labelledby={`charts-tab-${sections.indexOf(selectedSection)}`}
          >
            <div className="charts-card-grid">
              {selectedSection.metrics.map((metric) => (
                <MetricCard
                  key={metric.key}
                  name={metric.name}
                  values={metric.values}
                  lastCompleteBucket={lastCompleteBucket}
                  granularity={chartSeries.granularity}
                  trend={metric.trend}
                  formatValue={metric.formatValue}
                  isSelected={metric.key === selectedMetricKey}
                  onSelect={() => setSelectedMetricKey(metric.key)}
                />
              ))}
            </div>
          </section>
        ) : null}
        {selectedMetric ? (
          <MetricDetailChart
            metric={selectedMetric}
            buckets={chartSeries.buckets}
            granularity={chartSeries.granularity}
            currentBucketIsPartial={chartSeries.currentBucketIsPartial}
            baseline={selectedMetric.trend.baseline}
          />
        ) : null}
      </>
    );
  };

  return (
    <div className="charts-page">
      <div className="charts-panel">
        <h1 className="charts-title">Charts</h1>

        <div className="charts-controls">
          <div className="charts-control-group" role="group" aria-label="Granularity">
            {GRANULARITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="charts-control-button"
                aria-pressed={granularity === option.value}
                onClick={() => setGranularity(option.value)}
                disabled={loading || (option.value === 'day' && range === 'all')}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="charts-control-group" role="group" aria-label="Range">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="charts-control-button"
                aria-pressed={range === option.value}
                onClick={() => setRange(option.value)}
                disabled={loading || (option.value === 'all' && granularity === 'day')}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default ChartsPage;
