import { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
// import { usePost } from '../../hooks/usePost.js';
import { useUser } from '../../hooks/useUser.js';
// import { deleteById, toggleComplete } from '../../services/fetch-utils.js';
// import './PostCard.css';

// export default function PostCard({ task, id, completed, setPosts, posts }) {
export default function PostCard({ id, title, description, image_url, price, category, user_id }) {
  const { user } = useUser();
  // const { setLoading, setError } = usePost(id);
  // const [isCompleted, setIsCompleted] = useState(completed);

  if (!user) {
    return <Redirect to="/auth/sign-in" />;
  }

  return (
    <div className="post overlay" key={id}>
      {title}
      {description}
      {image_url}
      {price}
      {category}
      {user_id}
    </div>
  );
}

//
//
//
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
// const handleEdit = async () => {
//   await toggleComplete(!isCompleted, id);
//   setIsCompleted(!isCompleted);
// };

//   return (
//     <div className="post overlay" key={id}>
//       <Link className="buttons btn-align" to={`/admin/edit/${id}`}>
//         <img src="/edit.png" className="edit-button" alt="edit" />{' '}
//       </Link>
//       <Link className="buttons red-border" to={`/admin/${id}`} onClick={handleDelete}>
//         <img className=" " onClick={() => {}} src="/delete.png" name="delete" alt="delete" />
//       </Link>
//       <h1 onClick={() => handleEdit()} className={isCompleted ? 'completed-todo' : 'todo'} id={id}>
//         {isCompleted ? (
//           <>
//             <img className="unchecked-box" src="./unchecked.png" />
//             <img className="checked" src="./finished.png" />
//             <span className="task-span">{task}</span>
//           </>
//         ) : (
//           <>
//             <img className="unchecked" src="./unchecked.png" />
//             <span className="task-span">{task}</span>
//           </>
//         )}
//       </h1>
//     </div>
//   );
// }
