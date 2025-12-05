const BASE_URL = process.env.REACT_APP_HOME_URL;

// Customer sends a new message (creates new conversation)
export async function sendMessage(messageContent) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/messages`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageContent }),
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

// Admin sends a new message (creates new conversation)
export async function adminStartConversation(userId, messageContent) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/messages/admin/start`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, messageContent }),
      credentials: 'include',
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error || data.message || 'Failed to start conversation');
    }

    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Customer gets their own messages
export async function getMyMessages() {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/messages/my-messages`, {
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

// Customer replies to existing conversation
export async function replyToConversation(conversationId, messageContent) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/reply`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageContent, isFromAdmin: false }),
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

// Admin gets all conversations (for admin panel)
export async function getConversations() {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/messages/conversations`, {
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

// Admin gets specific conversation
export async function getConversationById(conversationId) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}`, {
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

// Admin gets all messages (legacy endpoint)
export async function getAllMessages() {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/messages`, {
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

// Admin marks message as read
export async function markMessageAsReadFetchCall(messageId) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/messages/${messageId}/read`, {
      method: 'PATCH',
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

// Admin replies to conversation
export async function addAdminReply(conversationId, messageContent) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/reply`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageContent, isFromAdmin: true }),
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

// Admin deletes a message
export async function deleteMessage(messageId) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/messages/${messageId}`, {
      method: 'DELETE',
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
