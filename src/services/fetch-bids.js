/// urls for both local and deployed
const BASE_URL = process.env.REACT_APP_HOME_URL;

export async function getBids(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/bids/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Error fetching auctions');
    }

    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Error fetching auctions', e);
    throw new Error(e.message || 'Error in getAuctions');
  }
}
