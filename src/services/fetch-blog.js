import { fetchWithAuth } from './fetchWithAuth';

const readJson = async (resp, fallbackMessage) => {
  if (resp.ok) return resp.json();
  const errorBody = await resp.json().catch(() => ({}));
  throw new Error(errorBody.message || `${fallbackMessage} (${resp.status})`);
};

export const getAdminBlogPosts = async () => {
  const resp = await fetchWithAuth('/api/v1/admin/blog', {
    headers: { Accept: 'application/json' },
  });
  return readJson(resp, 'Could not load blog posts');
};

export const createBlogPost = async ({ title, category }) => {
  const resp = await fetchWithAuth('/api/v1/admin/blog', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, category }),
  });
  return readJson(resp, 'Could not create the draft');
};
