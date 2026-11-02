import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { readToken } from '../Charts/chartSetup.js';

const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const fullDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

// Weeks start on Monday, matching Postgres date_trunc('week') on the Charts page.
const startOfWeek = (date) => addDays(date, -((date.getDay() + 6) % 7));

const RANGES = [
  {
    key: 'all',
    label: 'All time',
    stepDays: 7,
    // The week before the first signup, so the line starts at 0.
    firstPoint: (firstJoinDate) => addDays(startOfWeek(firstJoinDate), -7),
  },
  {
    key: 'lastYear',
    label: 'Last 12 months',
    stepDays: 7,
    firstPoint: (_firstJoinDate, now) =>
      startOfWeek(new Date(now.getFullYear(), now.getMonth() - 12, now.getDate())),
  },
  {
    key: 'lastMonth',
    label: 'Last month',
    stepDays: 1,
    firstPoint: (_firstJoinDate, now) =>
      new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
  },
];

// Each point is the total customer count at the end of its day or week, so
// customers who joined before the range still count toward it.
const buildTotals = (joinDates, firstPoint, lastPoint, stepDays) => {
  const pointDates = [];
  const totals = [];
  let joinedSoFar = 0;

  for (let point = firstPoint; point <= lastPoint; point = addDays(point, stepDays)) {
    const nextPoint = addDays(point, stepDays);
    while (joinedSoFar < joinDates.length && joinDates[joinedSoFar] < nextPoint) {
      joinedSoFar += 1;
    }
    pointDates.push(point);
    totals.push(joinedSoFar);
  }

  return { pointDates, totals };
};

const UserGrowthChart = ({ customers }) => {
  const [rangeKey, setRangeKey] = useState('all');

  const joinDates = customers
    .filter((customer) => customer.joinedAt)
    .map((customer) => new Date(customer.joinedAt))
    .sort((first, second) => first - second);

  if (joinDates.length === 0) return null;

  const now = new Date();
  const range = RANGES.find((candidate) => candidate.key === rangeKey);
  const isWeekly = range.stepDays === 7;
  const lastPoint = isWeekly ? startOfWeek(now) : addDays(now, 0);
  const { pointDates, totals } = buildTotals(
    joinDates,
    range.firstPoint(joinDates[0], now),
    lastPoint,
    range.stepDays
  );
  const lineColor = readToken('--color-accent');

  // Weekly ranges label only the first week of each month on the bottom axis.
  const tickLabels = pointDates.map((point, index) => {
    if (!isWeekly) return shortDate.format(point);
    return index === 0 || point.getMonth() !== pointDates[index - 1].getMonth()
      ? monthLabel.format(point)
      : null;
  });

  const data = {
    labels: pointDates.map((point) =>
      isWeekly ? `Week of ${fullDate.format(point)}` : fullDate.format(point)
    ),
    datasets: [
      {
        label: 'Customers',
        data: totals,
        borderColor: lineColor,
        backgroundColor: lineColor,
        borderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { autoSkip: !isWeekly, callback: (_value, index) => tickLabels[index] } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <section>
      <h2 className="user-growth-title">Customer growth</h2>
      <div className="customer-filters" role="group" aria-label="Growth chart range">
        {RANGES.map((option) => (
          <button
            key={option.key}
            type="button"
            className="customer-filter-button"
            aria-pressed={rangeKey === option.key}
            onClick={() => setRangeKey(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="user-growth-chart">
        <Line data={data} options={options} />
      </div>
    </section>
  );
};

export default UserGrowthChart;
