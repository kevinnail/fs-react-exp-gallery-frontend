import { usePosts } from '../../hooks/usePosts.js';
import { useUserStore } from '../../stores/userStore.js';
import GalleryPostCard from '../GalleryPostCard/GalleryPostCard.js';
import './Gallery.css';
import Loading from '../Loading/Loading.js';
import '../PostDetail/PostDetail.css';

export default function Gallery() {
  const { posts, loading } = usePosts();
  const { error } = useUserStore();

  if (error) {
    console.error(error);
  }
  // show loading spinner while waiting for posts to load1
  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <div className="gallery-list-container">
        {posts.map((post) => (
          <GalleryPostCard key={post.id} {...post} posts={posts} />
        ))}
      </div>
    </>
  );
}
