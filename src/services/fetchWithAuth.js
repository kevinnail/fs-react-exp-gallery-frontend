import { useUserStore } from '../stores/userStore';

const BASE_URL = process.env.REACT_APP_HOME_URL;

/**
 * Wrapper around fetch that handles 401 responses globally.
 * On 401, it signs out the user and redirects to the auth page.
 *
 * @param {string} endpoint - The API endpoint (can be full URL or path starting with /)
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} - The fetch response
 */
export async function fetchWithAuth(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const resp = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  if (resp.status === 401) {
    useUserStore.getState().signout();
    window.location.href = '/auth/sign-in';
    throw new Error('Session expired');
  }

  return resp;
}
