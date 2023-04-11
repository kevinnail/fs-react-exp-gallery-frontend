// fetchPosts.js
const fetch = require('node-fetch');
const BASE_URL = process.env.BASE_URL;

const handler = async (event) => {
  const authToken = event.headers.authorization;

  try {
    const response = await fetch(`${BASE_URL}/api/v1/admin`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    } else {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.message }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching posts' }),
    };
  }
};

module.exports = { handler };
