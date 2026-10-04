const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatMoney = (amount) => currencyFormatter.format(amount);

export const formatCount = (count) => count.toLocaleString('en-US');

export const formatPercent = (ratio) => `${Math.round(ratio * 100)}%`;

export const formatDays = (days) => {
  const wholeDays = Math.round(days);
  return `${wholeDays} ${wholeDays === 1 ? 'day' : 'days'}`;
};

export const formatChange = (change) => {
  const percent = Math.round(change * 100);
  return `${percent > 0 ? '+' : ''}${percent}%`;
};

export const PERIOD_PLURALS = { day: 'days', week: 'weeks', month: 'months' };

const bucketToDate = (bucket) => {
  const [year, month, day] = bucket.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const monthAndYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

export const formatBucket = (bucket, granularity) => {
  const date = bucketToDate(bucket);
  if (granularity === 'month') return monthAndYear.format(date);
  if (granularity === 'week') return `Week of ${shortDate.format(date)}`;
  return shortDate.format(date);
};
