const BASE_URL = process.env.REACT_APP_HOME_URL;

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
