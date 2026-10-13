import Markdown from 'react-markdown';
import './BlogPostBody.css';

const BlogPostBody = ({ blocks }) => (
  <div className="blog-post-body">
    {blocks.map((block) => (
      <div className="blog-post-body-text" key={block.id}>
        <Markdown>{block.body}</Markdown>
      </div>
    ))}
  </div>
);

export default BlogPostBody;
