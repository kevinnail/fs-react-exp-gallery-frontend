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
    additionalImages,
    setAdditionalImages,
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

  const handleSubmit = async (post, currentImages) => {
    setLoading(true);
    // console.log('post', post);
    // console.log('additionalImages', additionalImages);
    console.log('currentImages in submitHandler', currentImages);

    // sets default image (for gallery_posts table)
    post.image_url = currentImages[0];
    const { num_imgs, public_id } = await getPostDetail(id);
    post.num_imgs = num_imgs;
    post.public_id = public_id;

    try {
      // update database w/ post details
      await updatePost(postDetail.id, post);
      // ...and new images/ urls/ public ids to gallery_imgs table
      await postAddImages(post.newImages, postDetail.id);
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
