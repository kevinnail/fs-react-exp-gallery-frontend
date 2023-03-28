import { Redirect, useHistory, useParams } from 'react-router-dom';
import { getPostDetail, postAddImages, updatePost } from '../../services/fetch-utils.js';
import PostForm from '../PostForm/PostForm.js';
import { useUser } from '../../hooks/useUser.js';
import { usePost } from '../../hooks/usePost.js';
import React from 'react';

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
    additionalImageUrls,
  } = usePost(id);

  const { user } = useUser();

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  if (loading)
    return (
      <div className="loading">
        <h1>Loading! One moment please!</h1>
      </div>
    );
  if (error) return <h1>{error}</h1>;

  const handleSubmit = async (post, additionalImages, currentImages) => {
    setLoading(true);
    // console.log('post', post);
    // console.log('additionalImages', additionalImages);

    post.image_url = currentImages[0];
    // post.additionalImages = currentImages;
    // post.originalImages = currentImages;
    const { num_imgs, public_id } = await getPostDetail(id);
    post.num_imgs = num_imgs;
    post.public_id = public_id;

    try {
      console.log('post in the try block immediately before updatePost', post);

      await updatePost(postDetail.id, post);
      // do I need to update the additional images here?
      //
      console.log('post.newImages IN EDIT', post.newImages);

      await postAddImages(post.newImages, postDetail.id);

      //
      //
      //
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
      additionalImageUrls={additionalImageUrls}
    />
  );
}
