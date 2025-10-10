export default function UserCard({ user }) {
  const getTimeSinceJoined = (dateString) => {
    const joinDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - joinDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="user-card">
      <div className="user-image">
        {user.image_url ? (
          <img src={user.image_url} alt={user.profile?.firstName || 'User'} />
        ) : (
          <div className="user-image-placeholder" />
        )}
      </div>
      <div className="user-email">{user.email}</div>
      <div className="user-name">{user.profile?.firstName || '—'}</div>
      <div className="user-name">{user.profile?.lastName || '—'}</div>
      <div className="user-created">{formatDate(user.profile?.createdAt)}</div>
      <div className="user-time-since">{getTimeSinceJoined(user.profile?.createdAt)}</div>
    </div>
  );
}
