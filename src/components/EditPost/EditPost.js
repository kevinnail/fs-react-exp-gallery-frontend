import { Redirect, useHistory, useParams } from 'react-router-dom';
import { updatePost } from '../../services/fetch-utils.js';
import PostForm from '../PostForm/PostForm.js';
import { useUser } from '../../hooks/useUser.js';
import { usePost } from '../../hooks/usePost.js';
import React from 'react';

export default function EditPost() {
  const { id } = useParams();
  const history = useHistory();
  const { postDetail, loading, setLoading, error, setError } = usePost(id);
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

  const handleSubmit = async (task) => {
    setLoading(true);

    try {
      await updatePost(postDetail.id, task);
      history.push('/admin');
    } catch (e) {
      setError(e.message);
    }
  };

  return <PostForm {...postDetail} submitHandler={handleSubmit} />;
}
