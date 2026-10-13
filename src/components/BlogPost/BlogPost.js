import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../Loading/Loading.js';
import NotFound from '../NotFound/NotFound.js';
import BlogPostBody from '../BlogPostBody/BlogPostBody.js';
import { getBlogPost } from '../../services/fetch-blog.js';
import './BlogPost.css';

const formatBlogDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        setPost(await getBlogPost(slug));
      } catch (error) {
        toast.error(error.message, {
          theme: 'colored',
          toastId: 'blog-post-load-error',
          autoClose: true,
        });
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [slug]);

  if (loading) return <Loading />;
  if (!post) return <NotFound />;

  return (
    <main className="blog-post-page">
      <article className="blog-post-article">
        <h1 className="blog-post-title">{post.title}</h1>
        <BlogPostBody title={post.title} blocks={post.blocks} />
        <p className="blog-post-details">
          Posted {formatBlogDate(post.publishedAt)} in{' '}
          <Link
            className="blog-post-category-link"
            to={`/blog?category=${encodeURIComponent(post.category)}`}
          >
            {post.category}
          </Link>
        </p>
      </article>
    </main>
  );
};

export default BlogPost;
