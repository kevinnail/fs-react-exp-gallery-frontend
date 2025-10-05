import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext.js';
import { signOut } from '../../services/auth.js';
import Menu from '../Menu/Menu.js';
import './Profile.css';

export default function Profile() {
  const { user, setUser } = useContext(UserContext);
  const handleClick = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Still set user to null even if sign out fails
      setUser(null);
    }
  };

  return (
    <div className="profile-container">
      <div className="menu-search-container">
        <Menu handleClick={handleClick} />
      </div>

      <div className="profile-content">
        <h1>Welcome, {user?.user.email}!</h1>
        <p>This is your profile page. More functionality coming soon!</p>
      </div>
    </div>
  );
}
