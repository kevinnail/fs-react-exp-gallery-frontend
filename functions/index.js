const fetch = require('node-fetch');
require('dotenv').config({ path: `.env.development.local` });

const handler = async (event) => {
  const BASE_URL = process.env.BASE_URL;
  console.log('BASE_URL', BASE_URL);

  try {
    const resp = await fetch(`${BASE_URL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (resp.ok) {
      const user = await resp.json();
      return {
        statusCode: 200,
        body: JSON.stringify(user),
      };
    } else {
      return {
        statusCode: resp.status,
        body: 'Error fetching user data',
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching data' }),
    };
  }
};

module.exports = { handler };
