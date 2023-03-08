import { Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import { signOut } from '../../services/auth.js';
import './Header.css';

export default function Header() {
  const { user, setUser } = useUser();

  const handleClick = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <header>
      {/* <a href="/admin/new">
        <img className="icon" src="../bulletin-board-icon.png" />
      </a> */}

      <Link className="link" to="/admin">
        <img className="logo" src="../logo-sq.png" />
      </Link>
      <h1 className="title">Gallery Admin</h1>
      {user && (
        <div className="header-section">
          <p>
            Logged in as: <span> {user.email}</span> <br />
          </p>
          <Link className="link" to="/admin/new/new">
            New Post
          </Link>
          <button onClick={handleClick}>Sign Out</button>
        </div>
      )}
    </header>
  );
}
