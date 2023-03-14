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

  // const handleSubmit = async (title, description, image_url, price, category, additionalImages) => {
  const handleSubmit = async (newPost, additionalImages) => {
    try {
      console.log('additionalImages', additionalImages);

      // additionImages is an array of images that need to have their data sent to the server
      //
      const { title, description, image_url, price, category, author_id } = newPost;
      await postPost(title, description, image_url, price, category, author_id);

      history.push('/admin');
    } catch (e) {
      console.error(e.message);
    }
  };
  return <PostForm submitHandler={handleSubmit} />;
}
