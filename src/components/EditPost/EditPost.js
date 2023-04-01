import { Redirect, useHistory, useParams } from 'react-router-dom';
import {
  deleteImage,
  deleteImageData,
  getPostDetail,
  postAddImages,
  updatePost,
} from '../../services/fetch-utils.js';
import PostForm from '../PostForm/PostForm.js';
import { useUser } from '../../hooks/useUser.js';
import { usePost } from '../../hooks/usePost.js';
import React, { useState } from 'react';

export default function EditPost() {
  const { id } = useParams();
  const history = useHistory();
  const {
    postDetail,
    loading,
    setLoading,
    error,
    setError,
    imageUrls,
    setImageUrls,
    additionalImageUrlsPublicIds,
    additionalImages,
  } = usePost(id);

  const { user } = useUser();
  const [deletedImagePublicIds, setDeletedImagePublicIds] = useState([]);

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  // show loading spinner while waiting for posts to load1
  if (loading) {
    return (
      <div className="loading-div">
        <img className="loading" src="../logo-sq.png" />
      </div>
    );
  }

  if (error) return <h1>{error}</h1>;

  //  handleSubmit is called when the user clicks the submit button on the EditPost form
  const handleSubmit = async (post, currentImages, deletedImages) => {
    setLoading(true);
    post.image_url = currentImages[0];
    const { num_imgs, public_id } = await getPostDetail(id);
    post.num_imgs = num_imgs;
    post.public_id = public_id;

    try {
      await updatePost(postDetail.id, post);
      await postAddImages(post.newImages, postDetail.id);

      // Delete removed images from the database and Cloudinary
      for (const removedImageUrl of deletedImages) {
        const removedImage = additionalImages.find((image) => image.image_url === removedImageUrl);

        if (removedImage) {
          await deleteImage(removedImage.public_id);
          await deleteImageData(id, removedImage.public_id);
        }
      }
      history.push('/admin');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <PostForm
      {...postDetail}
      submitHandler={handleSubmit}
      setImageUrls={setImageUrls}
      imageUrls={imageUrls}
      additionalImageUrlsPublicIds={additionalImageUrlsPublicIds}
      additionalImages={additionalImages}
      deletedImagePublicIds={deletedImagePublicIds}
      setDeletedImagePublicIds={setDeletedImagePublicIds}
    />
  );
}
