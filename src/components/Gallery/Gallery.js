import { usePosts } from '../../hooks/usePosts.js';
import CoolSearchBox from '../CoolSearchBox/CoolSearchBox.js';
import GalleryPostCard from '../GalleryPostCard/GalleryPostCard.js';
import './Gallery.css';

export default function Gallery() {
  const { posts } = usePosts();
  const { loading } = usePosts();
  const handleSearch = (e) => {
    e.preventDefault();
    // search logic here
  };

  // show loading spinner while waiting for posts to load1
  if (loading) {
    return (
      <div className="loading-div">
        {/* <img className="loading" src="../logo-sq.png" /> */}
        <img className="rotating-marble" src="../marble-css.png" />
      </div>
    );
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
