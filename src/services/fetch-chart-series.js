import { fetchWithAuth } from './fetchWithAuth';

export const getChartSeries = async ({ granularity, range }) => {
  const query = new URLSearchParams({ granularity, range });
  const resp = await fetchWithAuth(`/api/v1/admin/chart-series?${query}`, {
    headers: { Accept: 'application/json' },
  });

  if (!resp.ok) {
    throw new Error(`Could not load charts (${resp.status})`);
  }

  return resp.json();
};
