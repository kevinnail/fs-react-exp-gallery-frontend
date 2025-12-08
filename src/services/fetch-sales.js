const BASE_URL = process.env.REACT_APP_HOME_URL;

export async function createSale(buyerEmail, postId, price, tracking) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/admin/sales`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        buyerEmail,
        postId,
        price,
        tracking,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) throw new Error(data.message || 'Failed to create sale');

    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getAllSales() {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/admin/sales`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await resp.json();

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

export async function updateSaleTracking(postId, trackingNumber) {
  try {
    if (!trackingNumber) {
      trackingNumber = '0';
    }
    const resp = await fetch(`${BASE_URL}/api/v1/admin/${postId}/tracking`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trackingNumber }),
      credentials: 'include',
    });

    const data = await resp.json();

    if (!resp.ok) throw new Error(data.message || 'Failed to update tracking');
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function updateSalePaidStatus(id, isPaid) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/admin/sale-pay-status/${id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        isPaid,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Failed to update paid status');

    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getUserSales() {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/user-sales`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Failed to fetch user sales');
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
