import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../Loading/Loading.js';
import BlogPostBody from '../BlogPostBody/BlogPostBody.js';
import {
  deleteBlogPost,
  getAdminBlogPost,
  getAdminBlogPosts,
  publishBlogPost,
  removeBlogCover,
  setBlogCover,
  updateBlogPost,
  uploadBlogImages,
} from '../../services/fetch-blog.js';
import { compressImageToJpeg } from '../../services/image-compress.js';
import { useBlogEditorStore } from '../../stores/blogEditorStore.js';
import './BlogEditor.css';

const acceptedImageTypes = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const CoverEditor = ({ postId, disabled, published, setUploadingCount }) => {
  const { coverImageUrl, setCoverImageUrl } = useBlogEditorStore();

  const handleDrop = async ([file]) => {
    setUploadingCount((count) => count + 1);
    try {
      const compressed = await compressImageToJpeg(file, { maxWidth: 2000, quality: 0.82 });
      const uploaded = await setBlogCover(postId, compressed);
      setCoverImageUrl(uploaded.coverImageUrl);
    } catch (error) {
      toast.error(`${file.name}: ${error.message}`, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3500,
      });
    } finally {
      setUploadingCount((count) => count - 1);
    }
  };

  const handleRemove = async () => {
    setUploadingCount((count) => count + 1);
    try {
      await removeBlogCover(postId);
      setCoverImageUrl(null);
    } catch (error) {
      toast.error(error.message, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3500,
      });
    } finally {
      setUploadingCount((count) => count - 1);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    onDropRejected: (rejections) =>
      toast.error(`${rejections[0].file.name}: not a single JPG, PNG or WebP`, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3500,
      }),
    disabled,
    multiple: false,
    accept: acceptedImageTypes,
  });

  return (
    <div className="blog-editor-images-block">
      {coverImageUrl && (
        <>
          <img
            className="blog-editor-cover-thumbnail"
            src={coverImageUrl}
            alt="Cover for the blog list"
          />
          <div className="blog-editor-block-controls">
            <button
              type="button"
              className="blog-editor-button blog-editor-button--remove"
              onClick={handleRemove}
              disabled={disabled || published}
            >
              Remove cover
            </button>
          </div>
        </>
      )}
      <div
        {...getRootProps({
          className: `form-image-dropzone${isDragActive ? ' form-image-dropzone--dragging' : ''}`,
        })}
      >
        <input {...getInputProps()} />
        <span className="form-image-dropzone-instructions">
          {coverImageUrl
            ? 'Drop a new cover here to replace it'
            : 'Drop the cover here, or click to choose'}
        </span>
      </div>
    </div>
  );
};

const ImagesBlockEditor = ({ postId, block, disabled, setUploadingCount }) => {
  const { addImages, removeImage, moveImage, updateCaption } = useBlogEditorStore();

  const handleDrop = async (acceptedFiles) => {
    setUploadingCount((count) => count + acceptedFiles.length);
    for (const file of acceptedFiles) {
      try {
        const compressed = await compressImageToJpeg(file, { maxWidth: 2000, quality: 0.82 });
        addImages(block.id, await uploadBlogImages(postId, [compressed]));
      } catch (error) {
        toast.error(`${file.name}: ${error.message}`, {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          autoClose: 3500,
        });
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
        { theme: 'colored', draggable: true, draggablePercent: 60, autoClose: 3500 }
      ),
    disabled,
    accept: acceptedImageTypes,
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
  const [confirmation, setConfirmation] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const {
    title,
    category,
    summary,
    coverImageUrl,
    blocks,
    loadPost,
    reset,
    setTitle,
    setCategory,
    setSummary,
    addTextBlock,
    addImagesBlock,
    removeBlock,
    moveBlock,
    updateText,
  } = useBlogEditorStore();

  // Save waits for photo and cover changes: a save during a photo upload would delete the
  // photo the blocks don't reference yet, and a save response landing after a cover change
  // would put the old cover back in the editor.
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
          draggable: true,
          draggablePercent: 60,
          autoClose: 3500,
        });
        navigate('/admin/blog');
      }
    };
    loadEditor();

    return () => reset();
  }, [id, loadPost, reset, navigate]);

  const askToConfirm = (details) => {
    setConfirmation(details);
    setConfirmationOpen(true);
  };

  const handleConfirm = () => {
    setConfirmationOpen(false);
    confirmation.onConfirm();
  };

  const handleRemove = (block) => {
    const isImages = block.type === 'images';
    const hasContent = isImages ? block.images.length > 0 : block.body.trim();
    if (!hasContent) {
      removeBlock(block.id);
      return;
    }
    askToConfirm({
      title: isImages ? 'Remove this photo group?' : 'Remove this text block?',
      message: isImages
        ? 'Its photos come out of the post, and are deleted when you save.'
        : 'Its text comes out of the post when you save.',
      confirmLabel: 'Remove',
      danger: true,
      onConfirm: () => removeBlock(block.id),
    });
  };

  const hasRequiredFields = () => {
    if (title.trim() && category.trim() && summary.trim() && coverImageUrl) return true;
    toast.error('Title, category, summary and cover picture are required', {
      theme: 'colored',
      toastId: 'blog-editor-validation',
      draggable: true,
      draggablePercent: 60,
      autoClose: 3500,
    });
    return false;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!hasRequiredFields()) return;

    setSaving(true);
    try {
      loadPost(await updateBlogPost(id, { title, category, summary, blocks }));
      toast.success('Saved', {
        theme: 'colored',
        toastId: 'blog-editor-saved',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3500,
      });
    } catch (error) {
      toast.error(error.message, {
        theme: 'colored',
        toastId: 'blog-editor-save-error',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3500,
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async () => {
    setSaving(true);
    try {
      await deleteBlogPost(id);
      toast.success('Post deleted', {
        theme: 'colored',
        toastId: 'blog-editor-deleted',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3500,
      });
      navigate('/admin/blog');
    } catch (error) {
      toast.error(error.message, {
        theme: 'colored',
        toastId: 'blog-editor-delete-error',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3500,
      });
      setSaving(false);
    }
  };

  const handleDelete = () =>
    askToConfirm({
      title: 'Delete this post?',
      message: 'The post and all its photos are deleted. This cannot be undone.',
      confirmLabel: 'Delete post',
      danger: true,
      onConfirm: deletePost,
    });

  const publishPost = async () => {
    setSaving(true);
    try {
      loadPost(await updateBlogPost(id, { title, category, summary, blocks }));
      const published = await publishBlogPost(id);
      setPublishedAt(published.publishedAt);
      toast.success('Published', {
        theme: 'colored',
        toastId: 'blog-editor-published',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3500,
      });
    } catch (error) {
      toast.error(error.message, {
        theme: 'colored',
        toastId: 'blog-editor-publish-error',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3500,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    if (!hasRequiredFields()) return;
    askToConfirm({
      title: 'Publish this post?',
      message: 'It goes live on the blog and stays published.',
      confirmLabel: 'Publish',
      danger: false,
      onConfirm: publishPost,
    });
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

        <div className="form-field">
          <label className="form-field-label" htmlFor="blog-editor-summary">
            Summary
          </label>
          <textarea
            id="blog-editor-summary"
            className="form-textarea"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-field">
          <span className="form-field-label">Cover picture</span>
          <CoverEditor
            postId={id}
            disabled={saving}
            published={Boolean(publishedAt)}
            setUploadingCount={setUploadingCount}
          />
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

        {view === 'edit' && (
          <div className="blog-editor-actions">
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
          </div>
        )}

        <div className="blog-editor-save-bar">
          <button className="admin-form-submit-button" type="submit" disabled={saving || uploading}>
            {uploading ? 'Updating photos…' : saving ? 'Saving…' : 'Save'}
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
          <button
            type="button"
            className="blog-editor-button blog-editor-button--remove"
            onClick={handleDelete}
            disabled={saving || uploading}
          >
            Delete post
          </button>
        </div>
      </form>

      <Dialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        aria-labelledby="blog-editor-dialog-title"
        aria-describedby="blog-editor-dialog-description"
        PaperProps={{
          sx: {
            backgroundColor: 'var(--color-surface)',
            backgroundImage: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 0,
            fontFamily: 'var(--font-body)',
          },
        }}
      >
        <DialogTitle id="blog-editor-dialog-title" sx={{ fontFamily: 'var(--font-display)' }}>
          {confirmation?.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="blog-editor-dialog-description"
            sx={{ fontFamily: 'var(--font-body)' }}
          >
            {confirmation?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button
            type="button"
            className="blog-editor-dialog-button"
            onClick={() => setConfirmationOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`blog-editor-dialog-button blog-editor-dialog-button--confirm${
              confirmation?.danger ? ' blog-editor-dialog-button--danger' : ''
            }`}
            onClick={handleConfirm}
            autoFocus
          >
            {confirmation?.confirmLabel}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BlogEditor;
