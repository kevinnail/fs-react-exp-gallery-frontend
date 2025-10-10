/// urls for both local and deployed
const BASE_URL = process.env.REACT_APP_HOME_URL;

/* Auth related functions */
export async function getAuctions() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auctions`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Error fetching auctions', e);
    throw new Error(e.message || 'Error fetching auctions');
  }
}
