const BASE_URL = process.env.REACT_APP_HOME_URL;

// Fetch all unread auction notifications for the current user
export async function getUnreadAuctionNotifications() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auction-notifications`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Error fetching auction notifications');
    }

    const data = await res.json();
    return data; // expected: array of notifications
  } catch (e) {
    console.error('Error fetching auction notifications', e);
    throw new Error(e.message || 'Error in getUnreadAuctionNotifications');
  }
}

// Mark all auction notifications as read for the current user
export async function markAuctionNotificationsRead() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auction-notifications/mark-read`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Error marking auction notifications as read');
    }

    const data = await res.json();
    return data; // expected: success message or updated count
  } catch (e) {
    console.error('Error marking auction notifications as read', e);
    throw new Error(e.message || 'Error in markAuctionNotificationsRead');
  }
}

// Optional: fetch all (read + unread) notifications if needed for admin or history
export async function getAllAuctionNotifications() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auction-notifications/all`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Error fetching all auction notifications');
    }

    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Error fetching all auction notifications', e);
    throw new Error(e.message || 'Error in getAllAuctionNotifications');
  }
}
