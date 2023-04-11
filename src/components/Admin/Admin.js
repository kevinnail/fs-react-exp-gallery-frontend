import React from 'react';
import { Redirect } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts.js';
import { useUser } from '../../hooks/useUser.js';
import PostCard from '../PostCard/PostCard.js';
import './Admin.css';
import { signOut } from '../../services/auth.js';
import Menu from '../Menu/Menu.js';
import Loading from '../Loading/Loading.js';

export default function Admin() {
  const { user, setUser } = useUser();
  const { posts, loading, setPosts } = usePosts();

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }
  const handleClick = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <>
      <div className="admin-container">
        <aside className="admin-panel ">
          <section className="admin-panel-section ">
            <div className="">
              <Menu handleClick={handleClick} />
            </div>
          </section>
        </aside>

        <div className="list-container">
          {loading ? (
            <Loading />
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
