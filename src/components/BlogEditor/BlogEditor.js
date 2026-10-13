import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../Loading/Loading.js';
import BlogPostBody from '../BlogPostBody/BlogPostBody.js';
import {
  getAdminBlogPost,
  getAdminBlogPosts,
  publishBlogPost,
  updateBlogPost,
  uploadBlogImages,
} from '../../services/fetch-blog.js';
import { compressImageToJpeg } from '../../services/image-compress.js';
import { useBlogEditorStore } from '../../stores/blogEditorStore.js';
import './BlogEditor.css';

const ImagesBlockEditor = ({ postId, block, disabled, setUploadingCount }) => {
  const { addImages, removeImage, moveImage, updateCaption } = useBlogEditorStore();

  const handleDrop = async (acceptedFiles) => {
    setUploadingCount((count) => count + acceptedFiles.length);
    for (const file of acceptedFiles) {
      try {
        const compressed = await compressImageToJpeg(file, { maxWidth: 2000, quality: 0.82 });
        addImages(block.id, await uploadBlogImages(postId, [compressed]));
      } catch (error) {
        toast.error(`${file.name}: ${error.message}`, { theme: 'colored', autoClose: true });
      } finally {
        setUploadingCount((count) => count - 1);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    onDropRejected: (rejections) =>
      toast.error(
        `${rejections.map((rejection) => rejection.file.name).join(', ')}: not a JPG, PNG or WebP`,
        { theme: 'colored', autoClose: true }
      ),
    disabled,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
  });

  return (
    <div className="blog-editor-images-block">
      {block.images.length > 0 && (
        <div className="blog-editor-images">
          {block.images.map((image, imageIndex) => (
            <div className="blog-editor-image" key={image.imageId}>
              <img
                className="blog-editor-image-thumbnail"
                src={image.imageUrl}
                alt={image.caption || `Photo ${imageIndex + 1}`}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Caption (optional)"
                aria-label={`Caption for photo ${imageIndex + 1}`}
                value={image.caption}
                onChange={(event) => updateCaption(block.id, image.imageId, event.target.value)}
                disabled={disabled}
              />
              <div className="blog-editor-block-controls">
                <button
                  type="button"
                  className="blog-editor-button"
                  onClick={() => moveImage(block.id, image.imageId, -1)}
                  disabled={disabled || imageIndex === 0}
                >
                  Move left
                </button>
                <button
                  type="button"
                  className="blog-editor-button"
                  onClick={() => moveImage(block.id, image.imageId, 1)}
                  disabled={disabled || imageIndex === block.images.length - 1}
                >
                  Move right
                </button>
                <button
                  type="button"
                  className="blog-editor-button blog-editor-button--remove"
                  onClick={() => removeImage(block.id, image.imageId)}
                  disabled={disabled}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div
        {...getRootProps({
          className: `form-image-dropzone${isDragActive ? ' form-image-dropzone--dragging' : ''}`,
        })}
      >
        <input {...getInputProps()} />
        <span className="form-image-dropzone-instructions">
          Drop photos here, or click to choose
        </span>
      </div>
    </div>
  );
};

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [existingCategories, setExistingCategories] = useState([]);
  const [slug, setSlug] = useState('');
  const [publishedAt, setPublishedAt] = useState(null);
  const [view, setView] = useState('edit');
  const {
    title,
    category,
    blocks,
    loadPost,
    reset,
    setTitle,
    setCategory,
    addTextBlock,
    addImagesBlock,
    removeBlock,
    moveBlock,
    updateText,
  } = useBlogEditorStore();

  // A save during an upload would delete the photo the server just stored,
  // because the blocks being saved don't reference it yet.
  const uploading = uploadingCount > 0;

  useEffect(() => {
    const loadEditor = async () => {
      try {
        const [post, posts] = await Promise.all([getAdminBlogPost(id), getAdminBlogPosts()]);
        loadPost(post);
        setSlug(post.slug);
        setPublishedAt(post.publishedAt);
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

    return () => reset();
  }, [id, loadPost, reset, navigate]);

  const handleRemove = (block) => {
    const hasContent = block.type === 'images' ? block.images.length > 0 : block.body.trim();
    const description = block.type === 'images' ? 'photo group' : 'text block';
    if (hasContent && !window.confirm(`Remove this ${description}?`)) return;
    removeBlock(block.id);
  };

  const hasRequiredFields = () => {
    if (title.trim() && category.trim()) return true;
    toast.error('Title and category are required', {
      theme: 'colored',
      toastId: 'blog-editor-validation',
      autoClose: true,
    });
    return false;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!hasRequiredFields()) return;

    setSaving(true);
    try {
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

  const handlePublish = async () => {
    if (!hasRequiredFields()) return;
    if (!window.confirm('Publish this post? It goes live on the blog and stays published.')) {
      return;
    }

    setSaving(true);
    try {
      loadPost(await updateBlogPost(id, { title, category, blocks }));
      const published = await publishBlogPost(id);
      setPublishedAt(published.publishedAt);
      toast.success('Published', {
        theme: 'colored',
        toastId: 'blog-editor-published',
        autoClose: true,
      });
    } catch (error) {
      toast.error(error.message, {
        theme: 'colored',
        toastId: 'blog-editor-publish-error',
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

        <div className="form-segmented-toggle">
          {[
            { value: 'edit', label: 'Edit' },
            { value: 'preview', label: 'Preview' },
          ].map((option) => (
            <label
              key={option.value}
              className={`form-segmented-toggle-option${view === option.value ? ' form-segmented-toggle-option--selected' : ''}`}
            >
              <input
                type="radio"
                name="blog-editor-view"
                checked={view === option.value}
                onChange={() => setView(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>

        {view === 'preview' && <BlogPostBody title={title} blocks={blocks} />}

        {view === 'edit' &&
          blocks.map((block, index) => (
            <div className="blog-editor-block" key={block.id}>
              {block.type === 'images' ? (
                <ImagesBlockEditor
                  postId={id}
                  block={block}
                  disabled={saving}
                  setUploadingCount={setUploadingCount}
                />
              ) : (
                <>
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
                </>
              )}
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
                  {block.type === 'images' ? 'Remove photo group' : 'Remove'}
                </button>
              </div>
            </div>
          ))}

        <div className="blog-editor-actions">
          {view === 'edit' && (
            <>
              <button
                type="button"
                className="blog-editor-button"
                onClick={addTextBlock}
                disabled={saving}
              >
                Add text
              </button>
              <button
                type="button"
                className="blog-editor-button"
                onClick={addImagesBlock}
                disabled={saving}
              >
                Add photos
              </button>
            </>
          )}
          <button className="admin-form-submit-button" type="submit" disabled={saving || uploading}>
            {uploading ? 'Uploading…' : saving ? 'Saving…' : 'Save'}
          </button>
          {publishedAt ? (
            <Link className="blog-editor-button" to={`/blog/${slug}`}>
              View live post
            </Link>
          ) : (
            <button
              type="button"
              className="blog-editor-button"
              onClick={handlePublish}
              disabled={saving || uploading}
            >
              Publish
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BlogEditor;
