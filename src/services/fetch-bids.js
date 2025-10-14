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

export async function placeBid({ auctionId, userId, bidAmount }) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/bids`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ auctionId, userId, bidAmount }),
      credentials: 'include',
    });

    const data = await resp;
    if (resp.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function buyItNow({ auctionId, userId }) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/bids/buy-it-now`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ auctionId, userId }),
      credentials: 'include',
    });

    const data = await resp;
    if (resp.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
