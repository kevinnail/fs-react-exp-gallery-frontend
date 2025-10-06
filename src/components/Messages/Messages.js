import React from 'react';
import { useUserStore } from '../../stores/userStore.js';
import { signOut } from '../../services/auth.js';
import Menu from '../Menu/Menu.js';
import './Messages.css';

export default function Messages() {
  const { signout } = useUserStore();

  const handleClick = async () => {
    try {
      await signOut();
      signout();
    } catch (error) {
      console.error('Error signing out:', error);
      signout();
    }
  };

  return (
    <div className="messages-container">
      <div className="menu-search-container">
        <Menu handleClick={handleClick} />
      </div>

      <div className="messages-content">
        <div className="messages-header">
          <h1>Messages</h1>
          <p>Contact me directly - I&apos;ll get back to you as soon as possible!</p>
        </div>

        <div className="messages-placeholder">
          <div className="placeholder-content">
            <h2>Coming Soon</h2>
            <p>
              Message system is being built. You&apos;ll be able to send me messages and I&apos;ll
              respond directly.
            </p>
            <div className="contact-info">
              <p>For now, you can reach me at:</p>
              <p className="email-contact">your-email@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
