const BASE_URL = process.env.REACT_APP_HOME_URL;

// Public: the token from the email link identifies the customer, no sign-in needed
export const unsubscribeFromEmails = async ({ token, all }) => {
  const resp = await fetch(`${BASE_URL}/api/v1/unsubscribe`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, all }),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const error = new Error(data.message || `Could not unsubscribe (${resp.status})`);
    error.status = resp.status;
    throw error;
  }

  return data; // { unsubscribedFrom: [...categories] }
};
