// import { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
// import { usePost } from '../../hooks/usePost.js';
import { useUser } from '../../hooks/useUser.js';
// import { deleteById, toggleComplete } from '../../services/fetch-utils.js';
// import './PostCard.css';

// export default function PostCard({ task, id, completed, setPosts, posts }) {
export default function PostCard({
  id,
  posts,
  title,
  description,
  image_url,
  category,
  price,
  author_id,
}) {
  const { user } = useUser();
  // const { setLoading, setError } = usePost(id);
  // const [isCompleted, setIsCompleted] = useState(completed);

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  //   return (
  //     <div className="post overlay" key={id}>
  //       {title}
  //     </div>
  //   );
  // }

  // delete the post
  // const handleDelete = async () => {
  //   try {
  //     await deleteById(id);
  //     const updatedPosts = posts.filter((post) => post.id !== id);
  //     setPosts(updatedPosts);
  //     setLoading(true);
  //   } catch (e) {
  //     setError(e.message);
  //   }
  // };

  // make the post card clickable and toggle the completed status
  const handleEdit = async () => {
    console.log('handleEdit');
  };

  return (
    <div className="post overlay" key={id}>
      <Link className="buttons btn-align" to={`/admin/edit/${id}`}>
        <img src="/edit.png" className="edit-button" alt="edit" />{' '}
      </Link>
      {/* <Link className="buttons red-border" to={`/admin/${id}`} onClick={handleDelete}>
        <img className=" " onClick={() => {}} src="/delete.png" name="delete" alt="delete" />
      </Link> */}
      <h1>title: {title}</h1>
      <p>desc: {description}</p>
      <p>img: {image_url}</p>
      <p>cat: {category}</p>
      <p>$ {price}</p>
      <p>ID: {id}</p>
    </div>
  );
}
