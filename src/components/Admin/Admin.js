import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts.js';
import { useUser } from '../../hooks/useUser.js';
import PostCard from '../PostCard/PostCard.js';
import './Admin.css';
import { signOut } from '../../services/auth.js';

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
        {/* <div className="prod-header">
          <span className="grid-3">Title</span>
          <span className="grid-2">All items:</span>
        </div> */}
        <aside className="admin-panel ">
          <section className="admin-panel-section ">
            <div className="">
              <Link className="new-link" to="/gallery">
                <span className="new-post-span">Gallery</span>{' '}
                {<img className="new-post-icon" src="../gallery.png" />}
              </Link>
              <Link className="new-link" to="/admin/new">
                <span className="new-post-span">New Post</span>{' '}
                {<img className="new-post-icon" src="../upload-1.png" />}
              </Link>
              <button className="signout-button" onClick={handleClick}>
                Sign Out {<img className="signout-nav-icon" src="../signout.png" />}
              </button>
            </div>
          </section>
        </aside>
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
