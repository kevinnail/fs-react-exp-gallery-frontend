import { Link, Redirect } from 'react-router-dom';
import { usePost } from '../../hooks/usePost.js';
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
  posts,
  title,
  description, //commented just for now
  image_url,
  category, //commented just for now
  price,
  setPosts,
}) {
  const post = usePost(id);

  const { user } = useUser();
  const { setLoading, setError } = usePost(id);
  const [deletedRowId, setDeletedRowId] = useState(null);

  // const [isCompleted, setIsCompleted] = useState(completed);   // use later and change this to isSold/ isAvailable or something like that

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  // delete the post
  const handleDelete = async () => {
    try {
      setDeletedRowId(id);
      // grab urls out of my database
      const postUrls = await getAdditionalImageUrlsPublicIds(id);

      // delete all images from cloudinary
      for (let i = 0; i < postUrls.length; i++) {
        await deleteImage(postUrls[i].public_id);
      }

      // delete the post from my database
      await deleteById(id);

      // delete the post from state, so it doesn't show up on the page
      const updatedPosts = posts.filter((post) => post.id !== id);
      setPosts(updatedPosts);
      setLoading(true);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className={`post ${post.postDetail.id === deletedRowId ? 'grayed-out' : ''}`} key={id}>
      <Link to={`/main-gallery/${id}`}>
        {image_url ? (
          <img className="admin-prod-img" src={image_url} alt="edit" />
        ) : (
          <>
            {post.additionalImages[0] && (
              <img className="admin-prod-img" src={post.additionalImages[0].image_url} alt="edit" />
            )}
          </>
        )}
      </Link>

      <p className="grid-s2 grid-e3 mobile-title">
        {title.length > 14 ? title.slice(0, 14) + '...' : title}
      </p>
      <p className="grid-s2 grid-e3 mobile-title-desk">{title}</p>
      <p className="grid-3">${price}</p>
      <p className="cat-desk">{category}</p>
      <p className="desc-desk">{description}</p>
      <div className="admin-prod-btn-cont grid-7">
        <Link className="buttons btn-align" to={`/admin/${id}`}>
          <img src="/edit.png" className="edit-button" alt="edit" />
        </Link>
        <Link className="buttons red-border" to={`/admin`} onClick={handleDelete}>
          <img
            className="delete-button"
            onClick={() => {}}
            src="/delete.png"
            name="delete"
            alt="delete"
          />
        </Link>
      </div>
    </div>
  );
}
