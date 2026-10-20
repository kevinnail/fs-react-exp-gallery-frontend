import Markdown from 'react-markdown';
import './BlogPostBody.css';

const BlogPostBody = ({ title, blocks }) => (
  <div className="blog-post-body">
    {blocks.map((block) => {
      if (block.type === 'images') {
        if (block.images.length === 0) return null;
        return (
          <div
            className={`blog-post-body-images${block.images.length > 1 ? ' blog-post-body-images--grid' : ''}`}
            key={block.id}
          >
            {block.images.map((image) => (
              <figure className="blog-post-body-figure" key={image.imageId}>
                <img
                  className="blog-post-body-image"
                  src={image.imageUrl}
                  alt={image.caption || `${title} photo`}
                  loading="lazy"
                />
                {image.caption && (
                  <figcaption className="blog-post-body-caption">{image.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        );
      }
      return (
        <div className="blog-post-body-text" key={block.id}>
          <Markdown>{block.body}</Markdown>
        </div>
      );
    })}
  </div>
);

export default BlogPostBody;
