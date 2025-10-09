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
    <div className="list-container">
      <div className="user-list-header">
        <span>ID</span>
        <span>Email</span>
        <span>Name</span>
        <span>Image</span>
      </div>
      {users.length === 0 ? (
        <div className="no-users">No users found</div>
      ) : (
        users.map((user) => <UserCard key={user.id} user={user} />)
      )}
    </div>
  );
}
