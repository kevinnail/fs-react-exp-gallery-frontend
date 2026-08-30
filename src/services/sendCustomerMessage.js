import { sendMessage } from './fetch-messages.js';

export const sendCustomerMessage = async ({ socket, messageContent, conversationId = null }) => {
  if (conversationId) {
    socket?.emit('send_message', { conversationId, messageContent });
    return { conversationId, message: null };
  }

  const message = await sendMessage(messageContent);

  socket?.emit('send_message', {
    conversationId: message.conversationId,
    messageContent,
    isFromAdmin: message.isFromAdmin,
    userId: message.userId,
    messageId: message.id,
  });

  return { conversationId: message.conversationId, message };
};
