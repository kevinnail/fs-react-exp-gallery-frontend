import { useState } from 'react';
import { useUser } from '../../hooks/useUser.js';
import './PostForm.css';

export default function PostForm({
  title = '',
  description = '',
  image_url = '',
  price = '',
  category = '',
  submitHandler,
}) {
  const [titleInput, setTitleInput] = useState(title);
  const [descriptionInput, setDescriptionInput] = useState(description);
  const [imageUrlInput, setImageUrlInput] = useState(image_url);
  const [priceInput, setPriceInput] = useState(price);
  const [categoryInput, setCategoryInput] = useState(category);
  const user = useUser();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    submitHandler({
      title: titleInput,
      description: descriptionInput,
      image_url: imageUrlInput,
      price: priceInput,
      category: categoryInput,
      user_id: user.id,
    });
  };

  return (
    <form className="new-post-form" onSubmit={handleFormSubmit}>
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
        <label className="form-title">Image URL</label>
        <br />
        <input
          placeholder="Enter image URL"
          className="input"
          type="text"
          name="image_url"
          value={imageUrlInput}
          onChange={(e) => setImageUrlInput(e.target.value)}
        />
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
        <label className="form-title">Category</label>
        <br />
        <input
          required
          placeholder="Enter category"
          className="input"
          type="text"
          name="category"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
        />
      </div>
      {/* <div>
        <label className="form-title">User ID</label>
        <br />
        <input
          required
          placeholder="Enter user ID"
          className="input"
          type="text"
          name="user_id"
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
        />
      </div> */}
      <div>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
