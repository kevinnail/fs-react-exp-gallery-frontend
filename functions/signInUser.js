const fetch = require('node-fetch');

const handler = async (event) => {
  const BASE_URL = process.env.BASE_URL;
  const { email, password } = JSON.parse(event.body);

  try {
    const resp = await fetch(`${BASE_URL}/api/v1/users/sessions`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (resp.ok) {
      return {
        statusCode: 200,
        body: 'User signed in successfully',
      };
    } else {
      const data = await resp.json();
      console.error(data.message);
      return {
        statusCode: resp.status,
        body: 'Error signing in user',
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed signing in user' }),
    };
  }
};

module.exports = { handler };
