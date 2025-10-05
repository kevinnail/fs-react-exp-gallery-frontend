import { Navigate } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts.js';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext.js';
import CoolSearchBox from '../CoolSearchBox/CoolSearchBox.js';
import GalleryPostCard from '../GalleryPostCard/GalleryPostCard.js';
import './Gallery.css';
import Loading from '../Loading/Loading.js';
import '../PostDetail/PostDetail.css';

export default function Gallery() {
  const { posts, loading } = usePosts();
  const { user, error } = useContext(UserContext);

  if (error) {
    console.error(error);
  }
  const handleSearch = (e) => {
    e.preventDefault();
    // search logic here
  };

  // show loading spinner while waiting for posts to load1
  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <div className="search-container">
        <CoolSearchBox onSearch={handleSearch} />
      </div>
      <div className="gallery-list-container">
        {posts.map((post) => (
          <GalleryPostCard key={post.id} {...post} posts={posts} />
        ))}
      </div>
    </>
  );
}
