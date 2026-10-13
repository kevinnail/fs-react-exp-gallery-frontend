import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../Loading/Loading.js';
import { getAdminBlogPost, getAdminBlogPosts, updateBlogPost } from '../../services/fetch-blog.js';
import { useBlogEditorStore } from '../../stores/blogEditorStore.js';
import './BlogEditor.css';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingCategories, setExistingCategories] = useState([]);
  const {
    title,
    category,
    blocks,
    loadPost,
    reset,
    setTitle,
    setCategory,
    addTextBlock,
    removeBlock,
    moveBlock,
    updateText,
  } = useBlogEditorStore();

  useEffect(() => {
    const loadEditor = async () => {
      try {
        const [post, posts] = await Promise.all([getAdminBlogPost(id), getAdminBlogPosts()]);
        loadPost(post);
        setExistingCategories([...new Set(posts.map((listedPost) => listedPost.category))].sort());
        setLoading(false);
      } catch (error) {
        toast.error(error.message, {
          theme: 'colored',
          toastId: 'blog-editor-load-error',
          autoClose: true,
        });
        navigate('/admin/blog');
      }
    };
    loadEditor();

    // Clear the store on the way out so this post's blocks never show up in the next one.
    return () => reset();
  }, [id, loadPost, reset, navigate]);

  const handleRemove = (block) => {
    if (block.body.trim() && !window.confirm('Remove this text block?')) return;
    removeBlock(block.id);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!title.trim() || !category.trim()) {
      toast.error('Title and category are required', {
        theme: 'colored',
        toastId: 'blog-editor-validation',
        autoClose: true,
      });
      return;
    }

    setSaving(true);
    try {
      // Reload from the response so a category the server matched to an existing
      // spelling ("hiking" saved as "Hiking") shows the way it was stored.
      loadPost(await updateBlogPost(id, { title, category, blocks }));
      toast.success('Saved', {
        theme: 'colored',
        toastId: 'blog-editor-saved',
        autoClose: true,
      });
    } catch (error) {
      toast.error(error.message, {
        theme: 'colored',
        toastId: 'blog-editor-save-error',
        autoClose: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-form-page">
      <div className="admin-form-header">
        <h1 className="admin-form-title">Edit post</h1>
      </div>

      <form className="blog-editor" onSubmit={handleSave}>
        <div className="form-field">
          <label className="form-field-label" htmlFor="blog-editor-title">
            Title
          </label>
          <input
            id="blog-editor-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-field">
          <label className="form-field-label" htmlFor="blog-editor-category">
            Category
          </label>
          <input
            id="blog-editor-category"
            type="text"
            className="form-input"
            list="blog-editor-category-options"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={saving}
          />
          <datalist id="blog-editor-category-options">
            {existingCategories.map((existingCategory) => (
              <option key={existingCategory} value={existingCategory} />
            ))}
          </datalist>
        </div>

        {blocks.map((block, index) => (
          <div className="blog-editor-block" key={block.id}>
            <textarea
              className="form-textarea"
              aria-label={`Text block ${index + 1}`}
              value={block.body}
              onChange={(event) => updateText(block.id, event.target.value)}
              disabled={saving}
            />
            <p className="form-field-hint">
              Markdown: [link text](https://example.com), **bold**, `code`
            </p>
            <div className="blog-editor-block-controls">
              <button
                type="button"
                className="blog-editor-button"
                onClick={() => moveBlock(block.id, -1)}
                disabled={saving || index === 0}
              >
                Move up
              </button>
              <button
                type="button"
                className="blog-editor-button"
                onClick={() => moveBlock(block.id, 1)}
                disabled={saving || index === blocks.length - 1}
              >
                Move down
              </button>
              <button
                type="button"
                className="blog-editor-button blog-editor-button--remove"
                onClick={() => handleRemove(block)}
                disabled={saving}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="blog-editor-actions">
          <button
            type="button"
            className="blog-editor-button"
            onClick={addTextBlock}
            disabled={saving}
          >
            Add text
          </button>
          <button className="admin-form-submit-button" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditor;
