export default function UserCard({ user }) {
  const profile = user.profile;

  const getTimeSinceJoined = (dateString) => {
    if (!dateString) return;
    const joinDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - joinDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="user-card">
      <div className="user-image">
        {profile?.imageUrl ? (
          <img src={profile?.imageUrl} alt={profile?.firstName || 'User'} />
        ) : (
          <div className="user-image-placeholder" />
        )}
      </div>
      <div className="user-email">{user.email}</div>
      <div className="user-name">
        {profile ? profile?.firstName + ' ' + profile?.lastName : '—'}
      </div>
      <div className="user-created">{formatDate(profile?.createdAt)}</div>
      <div className="user-time-since">{getTimeSinceJoined(profile?.createdAt)}</div>
    </div>
  );
}
