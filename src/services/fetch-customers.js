import { fetchWithAuth } from './fetchWithAuth';

export const getCustomerMetrics = async () => {
  const resp = await fetchWithAuth('/api/v1/admin/customers', {
    headers: { Accept: 'application/json' },
  });

  if (!resp.ok) {
    throw new Error(`Could not load customers (${resp.status})`);
  }

  return resp.json();
};
