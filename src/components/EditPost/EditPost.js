import { Redirect, useHistory, useParams } from 'react-router-dom';
import {
  deleteImage,
  getAdditionalImageUrls,
  getPostDetail,
  postAddImages,
  updatePost,
} from '../../services/fetch-utils.js';
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

  // const handleSubmit = async (post, currentImages) => {
  //   setLoading(true);
  //   // console.log('post', post);
  //   // console.log('additionalImages', additionalImages);
  //   console.log('currentImages in submitHandler', currentImages);

  //   // sets default image (for gallery_posts table)
  //   post.image_url = currentImages[0];
  //   const { num_imgs, public_id } = await getPostDetail(id);
  //   post.num_imgs = num_imgs;
  //   post.public_id = public_id;

  //   try {
  //     // update database w/ post details
  //     await updatePost(postDetail.id, post);
  //     // ...and new images/ urls/ public ids to gallery_imgs table
  //     await postAddImages(post.newImages, postDetail.id);
  //     history.push('/admin');
  //   } catch (e) {
  //     setError(e.message);
  //   }
  // };
  //
  // const fetchImagesWithPublicIds = async (postId) => {
  //   const images = await getAdditionalImageUrls(postId);
  //   const imageUrlToPublicIdMap = new Map();
  //   for (const image of images) {
  //     imageUrlToPublicIdMap.set(image.image_url, image.public_id);
  //   }
  //   console.log(' imageUrlToPublicIdMap', imageUrlToPublicIdMap);

  //   return imageUrlToPublicIdMap;
  // };

  // // submit handler for form (in PostForm.js)
  // const handleSubmit = async (post, currentImages) => {
  //   setLoading(true);

  //   // sets default image (for gallery_posts table)
  //   post.image_url = currentImages[0];
  //   const { num_imgs, public_id } = await getPostDetail(id);
  //   post.num_imgs = num_imgs;
  //   post.public_id = public_id;

  //   // get the rest of the images/ public ids
  //   const urlToPublicIdMap = await fetchImagesWithPublicIds(id);

  //   try {
  //     // Remove deleted images from the database
  //     const removedImageUrls = imageUrls.filter((url) => !currentImages.includes(url));
  //     for (const url of removedImageUrls) {
  //       const public_id = urlToPublicIdMap.get(url);
  //       console.log('public_id', public_id);
  //       await deleteImage(public_id);
  //     }

  //     // update database w/ post details
  //     await updatePost(postDetail.id, post);
  //     // Add new images to the database
  //     const newImages = currentImages.filter((img) => !imageUrls.includes(img));
  //     await postAddImages(newImages, postDetail.id);

  //     history.push('/admin');
  //   } catch (e) {
  //     setError(e.message);
  //   }
  // };
  const handleSubmit = async (post, currentImages) => {
    setLoading(true);
    console.log('hello');

    try {
      // Fetch the first image from the gallery_posts table
      const { image_url: firstImageUrl, public_id: firstImagePublicId } = await getPostDetail(id);

      // Fetch the rest of the images from the gallery_imgs table
      const additionalImages = await getAdditionalImageUrls(id);

      // Combine the first image and additional images into a single array
      const imagesWithPublicIds = [
        { image_url: firstImageUrl, public_id: firstImagePublicId },
        ...additionalImages,
      ];

      const newUrlToPublicIdMap = {};
      for (const img of imagesWithPublicIds) {
        newUrlToPublicIdMap[img.image_url] = img.public_id;
      }

      // Process images for deletion
      const imagesToDelete = imagesWithPublicIds.filter(
        (img) => !currentImages.includes(img.image_url)
      );
      for (const img of imagesToDelete) {
        await deleteImage(img.public_id);
      }

      // Update post
      post.image_url = currentImages[0];
      post.num_imgs = currentImages.length;
      post.public_id = newUrlToPublicIdMap[currentImages[0]];
      console.log('post.additionalImages', post.additionalImages);

      await updatePost(postDetail.id, post);

      // Add new images to gallery_imgs table
      await postAddImages(post.newImages, postDetail.id);

      history.push('/admin');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
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
