import { Link, Redirect } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import {
  deleteById,
  deleteImage,
  getAdditionalImageUrlsPublicIds,
} from '../../services/fetch-utils.js';
import './PostCard.css';
import { useState } from 'react';
import { usePost } from '../../hooks/usePost.js';

export default function PostCard({
  id,
  posts,
  title,
  description,
  image_url,
  category,
  price,
  setPosts,
  discountedPrice,
  originalPrice,
}) {
  const { user } = useUser();
  const { postDetail, additionalImages } = usePost(id); // Destructuring loading state
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
    <div className={`post ${postDetail.id === deletedRowId ? 'grayed-out' : ''}`} key={id}>
      <Link to={`/main-gallery/${id}`}>
        {image_url ? (
          <img
            className="admin-prod-img"
            src={image_url.endsWith('.mp4') ? `${image_url.slice(0, -4)}.jpg` : image_url}
            alt="edit"
          />
        ) : (
          additionalImages[0] && (
            <img
              className="admin-prod-img"
              src={
                additionalImages[0].image_url.endsWith('.mp4')
                  ? `${additionalImages[0].image_url.slice(0, -4)}.jpg`
                  : additionalImages[0].image_url
              }
              alt="edit"
            />
          )
        )}
      </Link>

      <p className="grid-s2 grid-e3 mobile-title">
        {title.length > 14 ? title.slice(0, 14) + '...' : title}
      </p>
      <p className="grid-s2 grid-e3 mobile-title-desk">{title}</p>
      <p className="grid-3">
        {isDiscounted ? (
          <>
            <span style={{ textDecoration: 'line-through', marginRight: '10px', color: 'red' }}>
              ${originalPrice}
            </span>
            <span>${discountedPrice}</span>
          </>
        ) : (
          <span>${price}</span>
        )}
      </p>
      <p className="cat-desk">{category}</p>
      <p className="desc-desk">{description}</p>
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
