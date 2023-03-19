import { Redirect, useHistory } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import { postAddImages, postPost } from '../../services/fetch-utils.js';
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
      // additionImages is an array of images that need to have their data sent to the server
      const { title, description, image_url, category, price, author_id, public_id, num_imgs } =
        newPost;

      // create new post with fetch call to db
      const post = await postPost(
        title,
        description,
        image_url,
        category,
        price,
        author_id,
        public_id,
        num_imgs
      );

      await postAddImages(additionalImages, post.id);
      history.push('/admin');
    } catch (e) {
      console.error(e.message);
    }
  };
  return <PostForm submitHandler={handleSubmit} />;
}
