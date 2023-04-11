const fetch = require('node-fetch');

const handler = async (event) => {
  const BASE_URL = process.env.BASE_URL;

  try {
    const resp = await fetch(`${BASE_URL}/api/v1/users/sessions`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (resp.ok) {
      return {
        statusCode: 200,
        body: 'User signed out successfully',
      };
    } else {
      return {
        statusCode: resp.status,
        body: 'Error signing out user',
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed signing out user' }),
    };
  }
};

module.exports = { handler };
