import { useState } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { uploadImagesAndCreatePost } from '../../services/fetch-utils.js';
import './PostForm.css';

export default function PostForm({
  title = '',
  description = '',
  price = '',
  category = '',
  submitHandler,
}) {
  const [titleInput, setTitleInput] = useState(title);
  const [descriptionInput, setDescriptionInput] = useState(description);
  const [imageFilesInput, setImageFilesInput] = useState([]);
  const [priceInput, setPriceInput] = useState(price);
  const [categoryInput, setCategoryInput] = useState(category);
  const { user } = useUser();

  const handleFileInputChange = (event) => {
    setImageFilesInput([...event.target.files]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const postDetails = {
        title: titleInput,
        description: descriptionInput,
        price: priceInput,
        category: categoryInput,
        author_id: user.id,
      };

      const newPost = await uploadImagesAndCreatePost(imageFilesInput, postDetails);

      submitHandler(newPost);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCategoryChange = (event) => {
    setCategoryInput(event.target.value);
  };

  return (
    <form className="new-post-form" onSubmit={handleFormSubmit} encType="multipart/form-data">
      <div>
        <label className="form-title">Title</label>
        <br />
        <input
          required
          placeholder="Enter title"
          className="input"
          type="text"
          name="title"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
        />
      </div>
      <div>
        <label className="form-title">Description</label>
        <br />
        <textarea
          required
          placeholder="Enter description"
          className="input"
          name="description"
          value={descriptionInput}
          onChange={(e) => setDescriptionInput(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="image">Images:</label>
        <input type="file" id="image" name="image" onChange={handleFileInputChange} multiple />
      </div>

      <div>
        <label className="form-title">Price</label>
        <br />
        <input
          required
          placeholder="Enter price"
          className="input"
          type="number"
          step="1"
          name="price"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          value={categoryInput}
          onChange={handleCategoryChange}
          className="input"
          required
        >
          <option value="">choose category</option>
          <option value="Beads">Beads</option>
          <option value="Blunt Tips">Blunt Tips</option>
          <option value="Bubblers">Bubblers</option>
          <option value="Collabs ">Collabs</option>
          <option value="Cups ">Cups</option>
          <option value="Goblets">Goblets</option>
          <option value="Iso Stations">Iso Stations</option>
          <option value="Marbles">Marbles</option>
          <option value="Dry Pieces">Dry Pieces</option>
          <option value="Pendants">Pendants</option>
          <option value="Recyclers">Recyclers</option>
          <option value="Rigs">Rigs</option>
          <option value="Slides">Slides</option>
          <option value="Spinner Caps">Spinner Caps</option>
          <option value="Terp Pearls">Terp Pearls</option>
          <option value="Misc">Misc</option>
        </select>
      </div>
      <div>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
