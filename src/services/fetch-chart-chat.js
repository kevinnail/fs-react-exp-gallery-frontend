import { fetchWithAuth } from './fetchWithAuth';

export const sendChartChat = async ({ granularity, range, messages }) => {
  const resp = await fetchWithAuth('/api/v1/admin/chart-chat', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ granularity, range, messages }),
    credentials: 'include',
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.message || `Chat request failed (${resp.status})`);
  }

  return resp.json();
};
