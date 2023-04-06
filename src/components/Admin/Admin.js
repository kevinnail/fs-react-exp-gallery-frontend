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

  return (
    <>
      <div className="admin-container">
        {/* <div className="prod-header">
          <span className="grid-3">Title</span>
          <span className="grid-2">All items:</span>
        </div> */}
        <div className="admin-panel">hi from inside the admin-panel</div>
        <div className="list-container">
          {loading ? (
            <div className="loading-div">
              <img className="loading" src="../logo-sq.png" />
            </div>
          ) : posts.length === 0 ? (
            <div className="loading">
              <h1>No posts yet!</h1>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} {...post} setPosts={setPosts} posts={posts} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
