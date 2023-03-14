import { useState } from 'react';
import { useUser } from '../../hooks/useUser.js';
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

    // Create a new FormData object and append the image files to it
    const formData = new FormData();
    imageFilesInput.forEach((file) => formData.append('imageFiles', file));

    try {
      // Make a fetch request to the backend endpoint that handles the file uploads
      const response = await fetch('http://localhost:7890/api/v1/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      // Parse the response as JSON
      const result = await response.json();
      const image_urls = result.map((image) => image.secure_url);
      console.log('image_urls', image_urls);

      // Create a new post object with the form input data and the Cloudinary image URLs
      const newPost = {
        title: titleInput,
        description: descriptionInput,
        // image_url: result.map((image) => image.secure_url),
        image_url: image_urls[0],
        price: priceInput,
        category: categoryInput,
        author_id: user.id,
      };

      // Call the submit handler with the new post object
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
