import { Redirect, useHistory } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import { postAddImages, postPost } from '../../services/fetch-utils.js';
import PostForm from '../PostForm/PostForm.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NewPost() {
  const history = useHistory();
  const { user } = useUser();

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  const handleSubmit = async (newPost) => {
    try {
      const {
        title,
        description,
        image_url,
        category,
        price,
        author_id,
        public_id,
        num_imgs,
        link,
        hide,
        sold,
      } = newPost;

      // create new post with fetch call to db
      const post = await postPost(
        title,
        description,
        image_url,
        category,
        price,
        author_id,
        public_id,
        num_imgs,
        link,
        hide,
        sold
      );

      // send image urls and public ids to db
      await postAddImages(newPost.additionalImages, post.id);
      history.push('/admin');
    } catch (e) {
      console.error(e.message);
      toast.error(`Failed to add post: ${e.message}`, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'new-post-1',
        autoClose: false,
      });
    }
  };
  return <PostForm submitHandler={handleSubmit} />;
}
