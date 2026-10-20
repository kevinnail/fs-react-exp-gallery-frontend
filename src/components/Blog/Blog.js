import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../Loading/Loading.js';
import { getBlogPosts } from '../../services/fetch-blog.js';
import './Blog.css';

const formatBlogDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setPosts(await getBlogPosts());
      } catch (error) {
        toast.error(error.message, {
          theme: 'colored',
          toastId: 'blog-load-error',
          draggable: true,
          draggablePercent: 60,
          autoClose: 3500,
        });
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const categories = [...new Set(posts.map((post) => post.category))].sort();

  const requestedCategory = searchParams.get('category') ?? '';
  const selectedCategory =
    categories.find((category) => category.toLowerCase() === requestedCategory.toLowerCase()) ??
    requestedCategory;
  const visiblePosts = selectedCategory
    ? posts.filter((post) => post.category === selectedCategory)
    : posts;

  const handleCategoryChange = (event) => {
    setSearchParams(event.target.value ? { category: event.target.value } : {});
  };

  if (loading) return <Loading />;

  return (
    <main className="blog-page">
      <div className="blog-page-header">
        <h1 className="blog-page-title">Blog</h1>
        {categories.length > 0 && (
          <div className="form-select-wrapper blog-category-filter">
            <select
              className="form-select"
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {visiblePosts.length === 0 ? (
        <p className="blog-empty">
          {selectedCategory ? 'No posts in this category yet.' : 'No posts yet.'}
        </p>
      ) : (
        <ul className="blog-post-list">
          {visiblePosts.map((post) => (
            <li className="blog-card" key={post.id}>
              <Link to={`/blog/${post.slug}`}>
                <img
                  className="blog-card-cover"
                  src={post.coverImageUrl}
                  alt={post.title}
                  loading="lazy"
                />
              </Link>
              <div>
                <h2 className="blog-card-title">
                  <Link className="blog-card-link" to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="blog-card-summary">{post.summary}</p>
                <p className="blog-card-details">
                  {formatBlogDate(post.publishedAt)} in {post.category}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default Blog;
