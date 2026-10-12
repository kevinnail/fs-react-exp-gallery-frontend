import { fetchWithAuth } from './fetchWithAuth';

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const readJson = async (resp, failureMessage) => {
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.message || `${failureMessage} (${resp.status})`);
  }

  return resp.json();
};

export const getChartChat = async (chatId) => {
  const resp = await fetchWithAuth(`/api/v1/admin/chart-chats/${chatId}`, {
    headers: { Accept: 'application/json' },
  });

  return readJson(resp, 'Could not load chat');
};

export const createChartChat = async ({ granularity, range, content }) => {
  const resp = await fetchWithAuth('/api/v1/admin/chart-chats', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ granularity, range, content }),
  });

  return readJson(resp, 'Chat request failed');
};

export const sendChartChatMessage = async (chatId, { granularity, range, content }) => {
  const resp = await fetchWithAuth(`/api/v1/admin/chart-chats/${chatId}/messages`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ granularity, range, content }),
  });

  return readJson(resp, 'Chat request failed');
};
