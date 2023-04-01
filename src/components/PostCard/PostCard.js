// import { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { usePost } from '../../hooks/usePost.js';
import { useUser } from '../../hooks/useUser.js';
import {
  deleteById,
  deleteImage,
  getAdditionalImageUrls,
  // getPostDetail,
} from '../../services/fetch-utils.js';
import './PostCard.css';

export default function PostCard({
  id,
  posts,
  title,
  // description, //commented just for now
  image_url, //commented just for now
  // category,  //commented just for now
  price,
  public_id,
  // num_imgs,
  // author_id,
  setPosts,
  additionalImages,
}) {
  const post = usePost(id);
  console.log('post', post);

  const { user } = useUser();
  const { setLoading, setError } = usePost(id);
  // const [isCompleted, setIsCompleted] = useState(completed);   // use later and change this to isSold/ isAvailable or something like that

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  // delete the post
  const handleDelete = async () => {
    try {
      // const postData = await getPostDetail(id);

      // grab urls out of my database
      const postUrls = await getAdditionalImageUrls(id);

      // delete all images from cloudinary
      for (let i = 0; i < postUrls.length; i++) {
        await deleteImage(postUrls[i].public_id);
      }

      // delete the post from my database
      await deleteById(id);
      // num_imgs ? await deleteRemainingImages(id) : await deleteImage(public_id);
      // await deleteRemainingImages(id);
      await deleteImage(public_id);
      const updatedPosts = posts.filter((post) => post.id !== id);
      setPosts(updatedPosts);
      setLoading(true);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="post overlay" key={id}>
      <Link to={`/gallery/${id}`}>
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

      <p className="grid-s2 grid-e4 ">{title.length > 9 ? title.slice(0, 9) + '...' : title}</p>
      <p className="grid-5">${price}</p>
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
