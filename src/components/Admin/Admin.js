import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts.js';
import { useUser } from '../../hooks/useUser.js';
import PostCard from '../PostCard/PostCard.js';
import './Admin.css';
import { signOut } from '../../services/auth.js';
import Menu from '../Menu/Menu.js';
import Loading from '../Loading/Loading.js';
import Inventory from '../Inventory/Inventory.js';

export default function Admin() {
  const { user, setUser } = useUser();
  const { posts, loading, setPosts, error } = usePosts();
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  const handleClick = async () => {
    await signOut();
    setUser(null);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="loading-div-wrapper">
        <h2 className="error-state">
          Something went wrong. Please refresh the page or try again later. Here{`'`}s the error
          message if it helps:
          <br />
          <span className="error-span">{error}</span>
        </h2>
      </div>
    );
  }

  return (
    <>
      <div className="admin-container">
        <aside className="admin-panel ">
          <section className="admin-panel-section ">
            <div>
              <Menu handleClick={handleClick} />
            </div>
          </section>
        </aside>

        <div className="list-container">
          {posts.length === 0 ? (
            <div className="loading">
              <h1>No posts yet!</h1>
            </div>
          ) : (
            posts
              .filter((post) => !selectedCategory || post.category === selectedCategory)
              .map((post) => <PostCard key={post.id} {...post} setPosts={setPosts} posts={posts} />)
          )}
        </div>
        <Inventory
          posts={posts}
          onCategorySelect={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
      </div>
    </>
  );
}
