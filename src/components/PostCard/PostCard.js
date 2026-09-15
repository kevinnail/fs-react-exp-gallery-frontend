import { Link, useNavigate } from 'react-router-dom';
import {
  deleteById,
  deleteImage,
  getAdditionalImageUrlsPublicIds,
  softDeleteGalleryPost,
} from '../../services/fetch-utils.js';
import './PostCard.css';
import { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// A video's poster frame lives beside it under the same name.
const thumbnailFor = (mediaUrl) =>
  mediaUrl.endsWith('.mp4') ? `${mediaUrl.slice(0, -4)}.jpg` : mediaUrl;

export default function PostCard({ id, post, posts, setPosts, discountedPrice, originalPrice }) {
  const navigate = useNavigate();

  const [deletedRowId, setDeletedRowId] = useState(null);
  const [hardDelete, setHardDelete] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  //eslint-disable-next-line
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine whether to show discounted price or not
  const isDiscounted = discountedPrice && parseFloat(discountedPrice) < parseFloat(originalPrice);

  // delete or soft delete the post
  const handleDelete = async () => {
    try {
      setDeletedRowId(id);
      if (hardDelete) {
        // grab urls out of my database
        const postUrls = await getAdditionalImageUrlsPublicIds(id);
        // delete all images from S3
        for (const postUrl of postUrls) {
          await deleteImage(postUrl.public_id, postUrl.resource_type);
        }
        // delete the post from my database
        await deleteById(id);
        // delete the post from state, so it doesn't show up on the page
        setPosts(posts.filter((existingPost) => existingPost.id !== id));
      } else {
        // soft delete
        await softDeleteGalleryPost(id);
        // update post in state to isDeleted = true
        setPosts(
          posts.map((existingPost) =>
            existingPost.id === id ? { ...existingPost, isDeleted: true } : existingPost
          )
        );
      }
    } catch (error) {
      console.error('Error deleting post:', error.message);
      toast.error(`Error deleting post: ${error.message}`, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'postCard-1',
        autoClose: false,
      });
    } finally {
      setDeletedRowId(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = async () => {
    await handleDelete();
    handleCloseDialog();
    setHardDelete(false);
  };

  // Visual indicator for soft-deleted posts
  const isSoftDeleted = post.isDeleted;

  const rowClassNames = [
    'admin-post-row',
    id === deletedRowId ? 'admin-post-row--deleting' : '',
    isSoftDeleted ? 'admin-post-row--deleted' : '',
    post.hide ? 'admin-post-row--hidden' : '',
    post.sold ? 'admin-post-row--sold' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={rowClassNames}>
      <Link className="admin-post-row-thumbnail" to={`/${id}`} aria-label={`View ${post.title}`}>
        {post.image_url ? <img src={thumbnailFor(post.image_url)} alt="" /> : null}
      </Link>

      <div className="admin-post-row-details">
        <span className="admin-post-row-title">{post.title}</span>
        <span className="admin-post-row-category">{post.category}</span>
      </div>

      <div className="admin-post-row-price">
        {isDiscounted ? (
          <>
            <span className="admin-post-row-original-price">${originalPrice}</span>
            <span className="admin-post-row-current-price">
              ${Number(post.discountedPrice).toFixed(2)}
            </span>
          </>
        ) : (
          <span className="admin-post-row-current-price">${post.price}</span>
        )}
      </div>

      <div className="admin-post-row-status-tags">
        {post.sold && <span className="admin-post-row-tag admin-post-row-tag--sold">Sold</span>}
        {post.hide && <span className="admin-post-row-tag">Hidden</span>}
        {isSoftDeleted && (
          <span className="admin-post-row-tag admin-post-row-tag--deleted">Deleted</span>
        )}
      </div>

      <div className="admin-post-row-actions">
        <button
          type="button"
          className="admin-post-row-button"
          onClick={() => navigate(`/admin/${id}`)}
          disabled={post.restricted ? post.restricted : false}
        >
          Edit
        </button>
        <button
          type="button"
          className="admin-post-row-button admin-post-row-button--danger"
          onClick={handleOpenDialog}
        >
          Delete
        </button>
      </div>

      <Dialog
        open={openDialog}
        onClose={isDeleting ? undefined : handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
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
        <DialogTitle id="alert-dialog-title" sx={{ fontFamily: 'var(--font-display)' }}>
          {hardDelete ? 'Delete this post permanently?' : 'Hide this post from the gallery?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ fontFamily: 'var(--font-body)' }}>
            {hardDelete
              ? 'Hard delete will permanently remove this post and all images. This action cannot be undone.'
              : 'Soft delete will hide this post from the gallery but retain its record for sales and user history.'}
          </DialogContentText>
          <label className="admin-post-hard-delete-option">
            <input
              type="checkbox"
              checked={hardDelete}
              onChange={() => setHardDelete((isOn) => !isOn)}
            />
            Hard delete (permanent)
          </label>
        </DialogContent>
        <DialogActions>
          {!isDeleting ? (
            <>
              <button
                type="button"
                className="admin-post-delete-dialog-button"
                onClick={handleCloseDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-post-delete-dialog-button admin-post-delete-dialog-button--confirm${
                  hardDelete ? ' admin-post-delete-dialog-button--danger' : ''
                }`}
                onClick={handleConfirmDelete}
                autoFocus
              >
                {hardDelete ? 'Delete forever' : 'Soft delete'}
              </button>
            </>
          ) : (
            <span className="admin-post-delete-dialog-status">Deleting…</span>
          )}
        </DialogActions>
      </Dialog>
    </li>
  );
}
