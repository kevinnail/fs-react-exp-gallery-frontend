import { useEffect, useMemo, useState } from 'react';
import { getChartSeries } from '../../../services/fetch-chart-series.js';
import { classifyTrend } from '../../../services/trendVerdict.js';
import { formatCount, formatMoney, formatPercent } from './chartFormat.js';
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

  return [
    { heading: 'Revenue', metrics: revenueMetrics },
    { heading: 'Orders and customers', metrics: ordersAndCustomersMetrics },
  ];
};

const ChartsPage = () => {
  const [granularity, setGranularity] = useState('week');
  const [range, setRange] = useState('6m');
  const [chartSeries, setChartSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMetricKey, setSelectedMetricKey] = useState('totalRevenue');

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

  const selectedMetric = sections
    .flatMap((section) => section.metrics)
    .find((metric) => metric.key === selectedMetricKey);

  const lastCompleteBucket =
    chartSeries && chartSeries.buckets.length > 1 ? chartSeries.buckets.at(-2) : null;

  const renderContent = () => {
    if (error) return <p className="charts-error">{error}</p>;
    if (!chartSeries) return <p className="charts-loading">Loading charts</p>;

    return (
      <>
        {sections.map((section) => (
          <section key={section.heading} className="charts-section">
            <h2 className="charts-section-title">{section.heading}</h2>
            <div className="charts-card-grid">
              {section.metrics.map((metric) => (
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
        ))}
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
