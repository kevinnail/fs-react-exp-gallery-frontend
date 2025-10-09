export default function UserCard({ user }) {
  return (
    <div className="user-card">
      <div className="user-id">{user.id}</div>
      <div className="user-email">{user.email}</div>
      <div className="user-name">{user.firstName ? `${user.firstName} ${user.lastName}` : '—'}</div>
      <div className="user-image">
        {user.image_url ? (
          <img src={user.image_url} alt={user.firstName || 'User'} />
        ) : (
          <div className="user-image-placeholder" />
        )}
      </div>
    </div>
  );
}
