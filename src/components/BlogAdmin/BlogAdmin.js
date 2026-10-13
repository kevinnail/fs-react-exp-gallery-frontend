import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../Loading/Loading.js';
import { createBlogPost, getAdminBlogPosts } from '../../services/fetch-blog.js';
import './BlogAdmin.css';

const BlogAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [creating, setCreating] = useState(false);

  const existingCategories = [...new Set(posts.map((post) => post.category))].sort();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setPosts(await getAdminBlogPosts());
      } catch (error) {
        toast.error(error.message, {
          theme: 'colored',
          toastId: 'blog-admin-load-error',
          autoClose: true,
        });
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !category.trim()) {
      toast.error('Title and category are required', {
        theme: 'colored',
        toastId: 'blog-admin-validation',
        autoClose: true,
      });
      return;
    }

    setCreating(true);
    try {
      const post = await createBlogPost({ title, category });
      // A new draft is the newest draft, which is where the server's ordering puts it.
      setPosts((currentPosts) => [post, ...currentPosts]);
      setTitle('');
      setCategory('');
    } catch (error) {
      toast.error(error.message, {
        theme: 'colored',
        toastId: 'blog-admin-create-error',
        autoClose: true,
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-form-page">
      <div className="admin-form-header">
        <h1 className="admin-form-title">Blog</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-column">
          <div className="form-field">
            <label className="form-field-label" htmlFor="blog-post-title">
              Title
            </label>
            <input
              id="blog-post-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={creating}
            />
          </div>

          <div className="form-field">
            <label className="form-field-label" htmlFor="blog-post-category">
              Category
            </label>
            <input
              id="blog-post-category"
              type="text"
              className="form-input"
              list="blog-post-category-options"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={creating}
            />
            <datalist id="blog-post-category-options">
              {existingCategories.map((existingCategory) => (
                <option key={existingCategory} value={existingCategory} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="admin-form-actions">
          <button className="admin-form-submit-button" type="submit" disabled={creating}>
            {creating ? 'Creating…' : 'Create draft'}
          </button>
        </div>
      </form>

      <div className="blog-admin-posts">
        {posts.length === 0 ? (
          <p className="blog-admin-empty">No posts yet.</p>
        ) : (
          <table className="blog-admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link className="blog-admin-title-link" to={`/admin/blog/${post.id}`}>
                      {post.title}
                    </Link>
                  </td>
                  <td>{post.category}</td>
                  <td>
                    {post.publishedAt ? (
                      <span className="status-chip status-chip--published">Published</span>
                    ) : (
                      <span className="status-chip status-chip--draft">Draft</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BlogAdmin;
