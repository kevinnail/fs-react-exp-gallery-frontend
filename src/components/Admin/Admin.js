import React from 'react';
import { Redirect } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts.js';
import { useUser } from '../../hooks/useUser.js';
import PostCard from '../PostCard/PostCard.js';
import './Admin.css';

export default function Admin() {
  const { user } = useUser();
  const { posts, loading, setPosts } = usePosts();

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  if (loading) {
    return (
      <div className="loading">
        <h1>Loading! One moment please!</h1>
      </div>
    );
  }
  return (
    <>
      <div className="admin">ADMIN</div>
      <div className="prod-header">
        <span className="grid-2">Title</span>
        <span className="grid-5">Price</span>
      </div>

      <div className="list-container">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} setPosts={setPosts} posts={posts} />
        ))}
      </div>
    </>
  );
}
