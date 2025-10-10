import { useEffect, useState } from 'react';
import { getAllUsers } from '../../../services/fetch-utils.js';
import UserCard from './UserCard';
import './UsersDashboard.css';

export default function UsersDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const res = await getAllUsers();
      setUsers(res || []);
    };
    getData();
  }, []);

  return (
    <div className="users-page-container">
      <div className="users-content">
        <h1 className="users-title">Registered Users</h1>

        <div className="users-list-wrapper">
          <div className="user-list-header">
            <span>Avatar</span>
            <span>Email</span>
            <span>Name</span>
            <span>Joined</span>
            <span>User Since</span>
          </div>

          <div className="user-list-body">
            {users.length === 0 ? (
              <div className="no-users">No users found</div>
            ) : (
              users.map((user) => <UserCard key={user.id} user={user} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
