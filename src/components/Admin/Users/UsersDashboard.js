import { useEffect, useState } from 'react';
import { getAllUsers } from '../../../services/fetch-utils.js';
import UserCard from './UserCard';
import './UsersDashboard.css';

export default function UsersDashboard() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const totalPages = Math.ceil(users.length / pageSize);
  const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);

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
        <p>Total users: {users.length - 4}</p>

        <div className="users-list-wrapper">
          <div className="user-list-header">
            <span>Avatar</span>
            <span>Email</span>
            <span>Name</span>
            <span>Joined</span>
            <span>User Since</span>
          </div>

          <div className="user-list-body">
            {paginatedUsers.length === 0 ? (
              <div className="no-users">No users found</div>
            ) : (
              paginatedUsers.map((user) => <UserCard key={user.id} user={user} />)
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Prev
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                className="pagination-button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
