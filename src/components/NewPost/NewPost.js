import { Redirect, useHistory } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import { postPost } from '../../services/fetch-utils.js';
import PostForm from '../PostForm/PostForm.js';

export default function NewPost() {
  const history = useHistory();
  const { user } = useUser();

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }
  const handleSubmit = async (task) => {
    try {
      await postPost(task);
      history.push('/admin');
    } catch (e) {
      console.error(e.message);
    }
  };
  return <PostForm submitHandler={handleSubmit} />;
}
