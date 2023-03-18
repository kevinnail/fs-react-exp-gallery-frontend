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
  const newOrEdit = title ? 'Edit Post' : 'New Gallery Post';

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

      submitHandler(newPost, newPost.additionalImages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCategoryChange = (event) => {
    setCategoryInput(event.target.value);
  };

  return (
    <>
      {/* <div className="admin">ADMIN</div> */}
      <form className="new-post-form" onSubmit={handleFormSubmit} encType="multipart/form-data">
        <h1 id="form-title-header">{newOrEdit}</h1>
        <div>
          {/* <label className="form-title" htmlFor="category">
            Category
          </label> */}
          <br />
          <select
            id="category"
            value={categoryInput}
            onChange={handleCategoryChange}
            className="image-input shadow-border"
            required
          >
            <option value="" disabled selected>
              Choose category
            </option>
            <option value="Beads">Beads</option>
            <option value="Blunt Tips">Blunt Tips</option>
            <option value="Bubblers">Bubblers</option>
            <option value="Collabs">Collabs</option>
            <option value="Cups">Cups</option>
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
          {/* <label className="form-title">Title</label> */}
          <br />
          <input
            required
            maxLength={50}
            placeholder="Enter title"
            className="image-input"
            type="text"
            name="title"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
        </div>
        <div>
          {/* <label className="form-title">Description</label> */}
          <br />
          <textarea
            required
            maxLength={350}
            placeholder="Enter description"
            className="image-input description shadow-border"
            name="description"
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
          />
        </div>

        <div>
          {/* <label className="form-title">Price</label> */}
          <br />
          <input
            required
            placeholder="Enter price"
            className="image-input"
            type="number"
            step="1"
            name="price"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
          />
        </div>

        <div>
          {/* <label className="form-title " htmlFor="image">
            Images
          </label> */}
          <br />
          <input
            type="file"
            id="image"
            className="file-upload-btn shadow-border"
            name="image"
            onChange={handleFileInputChange}
            multiple
          />
        </div>

        <div className="btn-container">
          <button className="submit-btn" type="submit">
            {<img className="upload-icon " src="/upload.png" alt="upload" />}
          </button>
        </div>
      </form>
    </>
  );
}
