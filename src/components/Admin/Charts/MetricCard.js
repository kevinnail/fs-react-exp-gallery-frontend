import { Line } from 'react-chartjs-2';
import { readToken } from './chartSetup.js';
import { formatBucket, formatChange, PERIOD_PLURALS } from './chartFormat.js';
import { NOT_ENOUGH_DATA } from '../../../services/trendVerdict.js';

const VERDICT_ARROWS = { up: '↑', flat: '→', down: '↓' };

const SPARKLINE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  events: [],
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: { x: { display: false }, y: { display: false, beginAtZero: true } },
  elements: { point: { radius: 0 } },
};

const MetricCard = ({
  name,
  values,
  lastCompleteBucket,
  granularity,
  trend,
  formatValue,
  isSelected,
  onSelect,
}) => {
  const lastCompleteValue = lastCompleteBucket ? values.at(-2) : null;

  const sparklineData = {
    labels: values.map((_value, index) => index),
    datasets: [
      {
        data: values,
        borderColor: readToken('--color-text'),
        borderWidth: 2,
      },
    ],
  };

  return (
    <button type="button" className="metric-card" aria-pressed={isSelected} onClick={onSelect}>
      <span className="metric-card-name">{name}</span>
      <span className="metric-card-value">
        {lastCompleteValue === null ? 'None yet' : formatValue(lastCompleteValue)}
      </span>
      {lastCompleteBucket ? (
        <span className="metric-card-period">{formatBucket(lastCompleteBucket, granularity)}</span>
      ) : null}
      {trend.verdict === NOT_ENOUGH_DATA ? (
        <span className="metric-card-verdict metric-card-verdict--neutral">
          Not enough data yet
        </span>
      ) : (
        <span className={`metric-card-verdict metric-card-verdict--${trend.tone}`}>
          {VERDICT_ARROWS[trend.verdict]} {trend.verdict}, {formatChange(trend.change)} vs prior 4{' '}
          {PERIOD_PLURALS[granularity]}
        </span>
      )}
      <span className="metric-card-sparkline">
        <Line data={sparklineData} options={SPARKLINE_OPTIONS} aria-hidden="true" />
      </span>
    </button>
  );
};

export default MetricCard;
