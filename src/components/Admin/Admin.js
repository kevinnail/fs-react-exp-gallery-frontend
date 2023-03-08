import React from 'react';
import { Redirect } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts.js';
import { useUser } from '../../hooks/useUser.js';
import PostCard from '../PostCard/PostCard.js';

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
    <div className="list-container">
      {posts.map((post) => (
        <PostCard key={post.id} {...post} task={post.task} setPosts={setPosts} posts={posts} />
      ))}
    </div>
  );
}
