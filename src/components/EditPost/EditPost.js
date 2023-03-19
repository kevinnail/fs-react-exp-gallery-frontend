import { Redirect, useHistory, useParams } from 'react-router-dom';
import { updatePost } from '../../services/fetch-utils.js';
import PostForm from '../PostForm/PostForm.js';
import { useUser } from '../../hooks/useUser.js';
import { usePost } from '../../hooks/usePost.js';
import React from 'react';

export default function EditPost() {
  const { id } = useParams();
  const history = useHistory();
  const { postDetail, loading, setLoading, error, setError, imageUrls, setImageUrls } = usePost(id);
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

  const handleSubmit = async (post) => {
    setLoading(true);

    try {
      await updatePost(postDetail.id, post);
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
    />
  );
}
