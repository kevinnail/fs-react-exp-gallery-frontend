# WebSocket Real-Time Messaging System

This document reflects the **current** (updated 11/3/25) WebSocket implementation and the latest behavior in the Stress Less Glass app messaging system.

## Overview

Real-time messaging is powered by Socket.IO.  
REST is now only used for:

- Loading messages on mount
- Creating the very first conversation for a user
- Marking messages as read as a fallback (WebSocket also handles this)

All **subsequent** messages after a conversation exists are sent via WebSocket only.

No optimistic UI is needed because the sender receives their own message instantly from the server echo.

---

## Architecture Summary

### Key Components

| File                         | Responsibility                               |
| ---------------------------- | -------------------------------------------- |
| `src/services/websocket.js`  | Shared Socket.IO client singleton            |
| `src/hooks/useWebSocket.js`  | Base WebSocket hook (connection + listeners) |
| `src/hooks/useMessaging.js`  | Messaging-specific state + event handlers    |
| `src/components/Messages/`   | Customer messaging UI                        |
| `src/components/AdminInbox/` | Admin messaging dashboard                    |

---

### Message Send Flow

1. User types message
2. WebSocket emits `send_message`
3. Server writes to DB
4. Server broadcasts `new_message` to room
5. Sender + recipient both receive the new message event
6. UI updates instantly from server echo

No speculative insert, no dupe UI risk.

---

### State and Flow Rules

| Behavior                       | Logic                                             |
| ------------------------------ | ------------------------------------------------- |
| First message ever from a user | REST to create conversation, then socket emit     |
| All other messages             | WebSocket only                                    |
| Unread badges                  | Updated via global App socket listener            |
| Optimistic UI                  | **Not used** _(server echo handles UI)_           |
| Typing indicators              | WebSocket events (`typing_start` / `typing_stop`) |

---

## WebSocket Events

### Client → Server

| Event                | Meaning                  |
| -------------------- | ------------------------ |
| `send_message`       | Send chat message        |
| `join_conversation`  | Subscribe to a room      |
| `leave_conversation` | Unsubscribe from a room  |
| `typing_start`       | User started typing      |
| `typing_stop`        | User stopped typing      |
| `mark_message_read`  | Mark as read (real-time) |

### Server → Client

| Event                  | Meaning                                   |
| ---------------------- | ----------------------------------------- |
| `new_message`          | A new chat message (echoes to sender too) |
| `message_read`         | Message read state changed                |
| `conversation_updated` | Conversation metadata changed             |
| `user_typing`          | Opposite user typing indicator            |
| `new_customer_message` | Admin-only inbox badge updates            |

---

## Typing Indicator

Typing is debounced and cleared automatically after inactivity.

- Users broadcast typing start/stop
- UI updates via `typingUsers` state
- Timeout resets after ~1s of no input

---

## Unread Message Logic

- Global App-level WebSocket listener increments unread count
- Count resets when:
  - User navigates to `/messages` page, or
  - Admin opens a specific conversation
- Removed the old `useUnreadMessages` hook
- Notification logic is centralized

---

## Connection Behavior

- Guaranteed single WebSocket connection
- Automatic reconnection
- Socket disconnects on sign out
- Socket initialized only in `useWebSocket`, not per component

---

## Admin Functionality

| Feature                             | Behavior                        |
| ----------------------------------- | ------------------------------- |
| Admin replies                       | Sent over WebSocket only        |
| Admin sees own messages echoed back | Ensures UI sync                 |
| Conversation sidebar refresh        | Reloads after customer messages |

---

## Removed Legacy Logic

| Removed                     | Reason                             |
| --------------------------- | ---------------------------------- |
| Optimistic UI temp messages | Server echo makes UI instant       |
| Duplicate WebSocket hookups | Centralized in `useWebSocket`      |
| `useUnreadMessages` hook    | Global badge logic now             |
| Mixed REST & WebSocket send | WebSocket only after first message |

---

## Backend Notes

- WebSocket connection authenticates via cookie JWT
- `socket.userId` and `socket.isAdmin` set on handshake
- Server emits to:
  - User rooms (`user_<id>`)
  - Conversation rooms (`conversation_<id>`)
  - Admin room (`admin_room`)

---

## Manual Testing Steps

1. Open admin inbox + user messages page in two windows
2. Send message from user
   - Should appear instantly in both UIs
3. Send reply from admin
   - Should appear instantly in both UIs
4. Watch typing indicators update
5. Verify unread badge increments only when other party sends

---

## Future Enhancements

- Message delivery receipts
- Online / offline presence indicators
- Push notifications
- E2E encryption possibility
- Streaming typing text (if wanted)
- Real-time conversation list push vs reload

---

## Summary

The messaging system now uses:

- **WebSocket-first architecture**
- **Server echo instead of optimistic UI**
- A **single** global socket connection
- Centralized unread badge state
- Room-based targeted message delivery

Behavior is stable, modern, and scalable.
