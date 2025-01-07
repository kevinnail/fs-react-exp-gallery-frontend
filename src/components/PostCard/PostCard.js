import { Link, Redirect } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import {
  deleteById,
  deleteImage,
  getAdditionalImageUrlsPublicIds,
} from '../../services/fetch-utils.js';
import './PostCard.css';
import { useState } from 'react';

export default function PostCard({
  id,
  post,
  posts,
  image_url,
  setPosts,
  discountedPrice,
  originalPrice,
}) {
  const { user } = useUser();
  const [deletedRowId, setDeletedRowId] = useState(null);

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

  return (
    <div className={`post ${id === deletedRowId ? 'grayed-out' : ''}`} key={id}>
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

      <div className="grid-s2" style={{ display: 'grid', gridTemplateRows: '30px' }}>
        <span className="grid-s2 grid-e3 mobile-title">
          {post.title.length > 14 ? post.title.slice(0, 14) + '...' : post.title}
        </span>
        <span className="grid-s2 grid-e3 mobile-title sold-hightlight">
          {post.sold ? ' SOLD ' : ''}
        </span>
        <span className="grid-s2 grid-e3 mobile-title-desk">{post.title}</span>
        <span className="grid-s2 grid-e3 mobile-title-desk sold-hightlight">
          {post.sold ? 'SOLD' : ''}
        </span>
      </div>
      <div>
        {' '}
        <span className="grid-3" style={{ display: 'grid' }}>
          {isDiscounted ? (
            <>
              <span style={{ textDecoration: 'line-through', marginRight: '10px', color: 'red' }}>
                ${originalPrice}
              </span>
              <span>${post.discountedPrice}</span>
            </>
          ) : (
            <span>${post.price}</span>
          )}
        </span>
      </div>
      <span className="cat-desk">{post.category}</span>
      <span className="desc-desk">{post.description}</span>
      <div className="admin-prod-btn-cont grid-7">
        <Link className="buttons btn-align" to={`/admin/${id}`}>
          <img src="/edit.png" className="edit-button" alt="edit" />
        </Link>
        <Link className="buttons red-border" to={`/admin`} onClick={handleDelete}>
          <img className="delete-button" src="/delete.png" name="delete" alt="delete" />
        </Link>
      </div>
    </div>
  );
}
