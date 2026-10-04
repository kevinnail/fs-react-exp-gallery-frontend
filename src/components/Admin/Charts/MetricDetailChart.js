import { Chart } from 'react-chartjs-2';
import { readToken } from './chartSetup.js';
import { formatBucket } from './chartFormat.js';

// Appended to a hex token, this draws the in-progress period at 40% opacity.
const PARTIAL_PERIOD_ALPHA = '66';

const MetricDetailChart = ({ metric, buckets, granularity, currentBucketIsPartial, baseline }) => {
  const lastIndex = buckets.length - 1;

  const labels = buckets.map((bucket, index) => {
    const label = formatBucket(bucket, granularity);
    return currentBucketIsPartial && index === lastIndex ? `${label} (to date)` : label;
  });

  const barDatasets = metric.parts.map((part) => {
    const color = readToken(part.colorToken);
    return {
      type: 'bar',
      label: part.label,
      data: part.values,
      stack: 'metric',
      backgroundColor: part.values.map((_value, index) =>
        currentBucketIsPartial && index === lastIndex ? `${color}${PARTIAL_PERIOD_ALPHA}` : color
      ),
    };
  });

  // A separate stack keeps the baseline line from being added on top of the bars.
  const baselineDatasets = baseline
    ? [
        {
          type: 'line',
          label: 'Baseline, average of prior 4 periods',
          data: buckets.map(() => baseline),
          stack: 'baseline',
          borderColor: readToken('--color-text'),
          borderWidth: 2,
          borderDash: [6, 6],
          pointRadius: 0,
        },
      ]
    : [];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { callback: (value) => metric.formatValue(value) },
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${metric.formatValue(context.parsed.y)}`,
        },
      },
    },
  };

  return (
    <section className="metric-detail">
      <h2 className="metric-detail-title">{metric.name}</h2>
      <div className="metric-detail-chart">
        <Chart
          type="bar"
          data={{ labels, datasets: [...barDatasets, ...baselineDatasets] }}
          options={options}
        />
      </div>
    </section>
  );
};

export default MetricDetailChart;
