import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

// Registered once here so the sparkline and the detail chart do not depend on
// which of them happens to be imported first.
ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip
);

// Canvas cannot read CSS custom properties, so chart colors are resolved from
// tokens.css at draw time.
export const readToken = (tokenName) =>
  getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();

ChartJS.defaults.color = readToken('--color-text');
ChartJS.defaults.borderColor = readToken('--color-border');
ChartJS.defaults.font.family = readToken('--font-body');
ChartJS.defaults.font.size = 16;
