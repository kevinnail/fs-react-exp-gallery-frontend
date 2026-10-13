import { fetchWithAuth } from './fetchWithAuth';

const BASE_URL = process.env.REACT_APP_HOME_URL;

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

export const getAdminBlogPost = async (id) => {
  const resp = await fetchWithAuth(`/api/v1/admin/blog/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return readJson(resp, 'Could not load the post');
};

export const updateBlogPost = async (id, { title, category, blocks }) => {
  const resp = await fetchWithAuth(`/api/v1/admin/blog/${id}`, {
    method: 'PUT',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, category, blocks }),
  });
  return readJson(resp, 'Could not save the post');
};

export const publishBlogPost = async (id) => {
  const resp = await fetchWithAuth(`/api/v1/admin/blog/${id}/publish`, {
    method: 'PATCH',
    headers: { Accept: 'application/json' },
  });
  return readJson(resp, 'Could not publish the post');
};

export const deleteBlogPost = async (id) => {
  const resp = await fetchWithAuth(`/api/v1/admin/blog/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  return readJson(resp, 'Could not delete the post');
};

export const uploadBlogImages = async (postId, files) => {
  const formData = new FormData();
  for (const file of files) {
    formData.append('imageFiles', file);
  }
  const resp = await fetchWithAuth(`/api/v1/admin/blog/${postId}/images`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  });
  return readJson(resp, 'Could not upload the image');
};

export const getBlogPosts = async () => {
  const resp = await fetch(`${BASE_URL}/api/v1/blog`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  return readJson(resp, 'Could not load the blog');
};

export const getBlogPost = async (slug) => {
  const resp = await fetch(`${BASE_URL}/api/v1/blog/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  if (resp.status === 404) return null;
  return readJson(resp, 'Could not load the post');
};
