import { Link, Redirect } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import {
  deleteById,
  deleteImage,
  getAdditionalImageUrlsPublicIds,
} from '../../services/fetch-utils.js';
import './PostCard.css';
import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min.js';

export default function PostCard({
  id,
  post,
  posts,
  image_url,
  setPosts,
  discountedPrice,
  originalPrice,
}) {
  const history = useHistory();

  const { user } = useUser();
  const [deletedRowId, setDeletedRowId] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [openDialog, setOpenDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  // Determine whether to show discounted price or not
  const isDiscounted = discountedPrice && parseFloat(discountedPrice) < parseFloat(originalPrice);

  // delete the post
  const handleDelete = async () => {
    try {
      setDeletedRowId(id);
      // grab urls out of my database
      const postUrls = await getAdditionalImageUrlsPublicIds(id);

      // delete all images from cloudinary
      for (let i = 0; i < postUrls.length; i++) {
        await deleteImage(postUrls[i].public_id, postUrls[i].resource_type);
      }

      // delete the post from my database
      await deleteById(id);

      // delete the post from state, so it doesn't show up on the page
      const updatedPosts = posts.filter((post) => post.id !== id);
      setPosts(updatedPosts);
    } catch (e) {
      console.error('Error deleting post:', e.message);
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
  };

  const handleEditPost = () => {
    history.push(`/admin/${id}`);
  };

  return (
    <Box
      className={`post ${id === deletedRowId ? 'grayed-out' : ''}`}
      key={id}
      sx={{ backgroundColor: post.hide ? 'orange' : '' }}
    >
      <Link to={`/main-gallery/${id}`}>
        {image_url ? (
          <img
            className="admin-prod-img"
            src={image_url.endsWith('.mp4') ? `${image_url.slice(0, -4)}.jpg` : image_url}
            alt="edit"
          />
        ) : (
          post.image_url && (
            <img
              className="admin-prod-img"
              src={
                post.image_url.endsWith('.mp4')
                  ? `${post.image_url.slice(0, -4)}.jpg`
                  : post.image_url
              }
              alt="edit"
            />
          )
        )}
      </Link>
      <Box className="grid-s2" style={{ display: 'grid', gridTemplateRows: '30px' }}>
        <Typography className="grid-s2 grid-e3 mobile-title">
          {post.title.length > 14 ? post.title.slice(0, 14) + '...' : post.title}
        </Typography>

        <Typography className="grid-s2 grid-e3 mobile-title sold-highlight">
          {post.sold ? ' SOLD ' : ''}
        </Typography>

        <Typography className="grid-s2 grid-e3 mobile-title-desk">
          {post.hide ? post.title + ' (HIDDEN) ' : post.title}
        </Typography>
        <Typography className="grid-s2 grid-e3 mobile-title-desk sold-highlight">
          {post.sold ? 'SOLD' : ''}
        </Typography>
      </Box>
      <Box>
        {' '}
        <Typography className="grid-3" style={{ display: 'grid' }}>
          {isDiscounted ? (
            <>
              <Typography
                style={{ textDecoration: 'line-through', marginRight: '10px', color: 'red' }}
              >
                ${originalPrice}
              </Typography>
              <Typography>${post.discountedPrice}</Typography>
            </>
          ) : (
            <Typography>${post.price}</Typography>
          )}
        </Typography>
      </Box>
      <Typography className="cat-desk">{post.category}</Typography>
      <Typography className="desc-desk">{post.description}</Typography>
      <Box className="admin-prod-btn-cont grid-7">
        <Button
          onClick={handleEditPost}
          sx={{ fontSize: '1rem' }}
          disabled={post.restricted ? post.restricted : false}
        >
          Edit
        </Button>

        <Button onClick={handleOpenDialog} sx={{ fontSize: '1rem' }}>
          Delete
        </Button>
      </Box>{' '}
      <Dialog
        open={openDialog}
        onClose={isDeleting ? undefined : handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Are you sure?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deleting this post will remove it permanently. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {!isDeleting ? (
            <Box>
              {' '}
              <Button onClick={handleCloseDialog} color="primary" sx={{ fontSize: '1rem' }}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="primary"
                sx={{ fontSize: '1rem' }}
                autoFocus
              >
                Confirm
              </Button>
            </Box>
          ) : (
            <Typography
              color="primary"
              sx={{
                padding: '5px',
                borderRadius: '5px',
                width: '150px',
                textAlign: 'center',
              }}
            >
              Deleting...
            </Typography>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
