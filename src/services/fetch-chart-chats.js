import { fetchWithAuth } from './fetchWithAuth';

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const throwUnlessOk = async (resp, failureMessage) => {
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.message || `${failureMessage} (${resp.status})`);
  }
};

const readJson = async (resp, failureMessage) => {
  await throwUnlessOk(resp, failureMessage);
  return resp.json();
};

export const getChartChatSummary = async ({ granularity, range }) => {
  const query = new URLSearchParams({ granularity, range });
  const resp = await fetchWithAuth(`/api/v1/admin/chart-chat-summary?${query}`, {
    headers: { Accept: 'application/json' },
  });

  return readJson(resp, 'Could not load the data summary');
};

export const getChartChats = async () => {
  const resp = await fetchWithAuth('/api/v1/admin/chart-chats', {
    headers: { Accept: 'application/json' },
  });

  return readJson(resp, 'Could not load saved chats');
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

export const renameChartChat = async (chatId, title) => {
  const resp = await fetchWithAuth(`/api/v1/admin/chart-chats/${chatId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ title }),
  });

  return readJson(resp, 'Could not rename chat');
};

export const deleteChartChat = async (chatId) => {
  const resp = await fetchWithAuth(`/api/v1/admin/chart-chats/${chatId}`, {
    method: 'DELETE',
  });

  await throwUnlessOk(resp, 'Could not delete chat');
};
