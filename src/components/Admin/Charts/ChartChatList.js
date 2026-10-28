import { useRef, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const ChartChatList = ({ chats, openChatId, onNewChat, onOpen, onRename, onDelete }) => {
  const [editingChatId, setEditingChatId] = useState(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Escape ends editing through the same blur as Enter, but without saving.
  const discardRenameRef = useRef(false);

  const startRename = (chat) => {
    setEditingChatId(chat.id);
    setTitleDraft(chat.title);
  };

  const finishRename = async (chat) => {
    setEditingChatId(null);
    const discard = discardRenameRef.current;
    discardRenameRef.current = false;
    if (discard || titleDraft === chat.title) return;
    await onRename(chat.id, titleDraft);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    await onDelete(chatToDelete.id);
    setIsDeleting(false);
    setChatToDelete(null);
  };

  return (
    <nav className="chart-chat-list" aria-label="Saved chats">
      <button type="button" className="chart-chat-new" onClick={onNewChat}>
        New chat
      </button>
      <ul className="chart-chat-list-items">
        {chats.map((chat) => (
          <li key={chat.id} className="chart-chat-list-item">
            {editingChatId === chat.id ? (
              <input
                className="chart-chat-rename-input"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={() => finishRename(chat)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') discardRenameRef.current = true;
                  if (event.key === 'Enter' || event.key === 'Escape') event.currentTarget.blur();
                }}
                maxLength={120}
                aria-label="Chat title"
                autoFocus
              />
            ) : (
              <button
                type="button"
                className="chart-chat-open"
                onClick={() => onOpen(chat.id)}
                aria-current={String(chat.id) === openChatId ? 'true' : undefined}
              >
                {chat.title}
              </button>
            )}
            <button
              type="button"
              className="chart-chat-row-action"
              onClick={() => startRename(chat)}
              aria-label={`Rename ${chat.title}`}
              title="Rename"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 20H8L18.5 9.5L14.5 5.5L4 16V20ZM16 4L20 8L21.5 6.5L17.5 2.5L16 4Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              type="button"
              className="chart-chat-row-action"
              onClick={() => setChatToDelete(chat)}
              aria-label={`Delete ${chat.title}`}
              title="Delete"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 3H15L16 5H20V7H4V5H8L9 3ZM6 9H18L17 21H7L6 9Z" fill="currentColor" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={chatToDelete !== null}
        onClose={isDeleting ? undefined : () => setChatToDelete(null)}
        aria-labelledby="chart-chat-delete-title"
        aria-describedby="chart-chat-delete-description"
        PaperProps={{
          sx: {
            backgroundColor: 'var(--color-surface)',
            backgroundImage: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 0,
            fontFamily: 'var(--font-body)',
          },
        }}
      >
        <DialogTitle id="chart-chat-delete-title" sx={{ fontFamily: 'var(--font-display)' }}>
          Delete this chat?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="chart-chat-delete-description"
            sx={{ fontFamily: 'var(--font-body)' }}
          >
            {chatToDelete ? `"${chatToDelete.title}" and all its messages will be removed.` : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {!isDeleting ? (
            <>
              <button
                type="button"
                className="chart-chat-dialog-button"
                onClick={() => setChatToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="chart-chat-dialog-button chart-chat-dialog-button--danger"
                onClick={confirmDelete}
                autoFocus
              >
                Delete
              </button>
            </>
          ) : (
            <span className="chart-chat-dialog-status">Deleting…</span>
          )}
        </DialogActions>
      </Dialog>
    </nav>
  );
};

export default ChartChatList;
