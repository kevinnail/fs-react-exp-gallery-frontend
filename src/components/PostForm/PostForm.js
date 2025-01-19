// import { useState } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { uploadImagesAndCreatePost } from '../../services/fetch-utils.js';
import './PostForm.css';
import Menu from '../Menu/Menu.js';
import { signOut } from '../../services/auth.js';
import Loading from '../Loading/Loading.js';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function PostForm({
  category = '',
  title = '',
  description = '',
  price = '',
  discountedPrice,
  selling_link = '',
  sold = false,
  imageUrls,
  submitHandler,
}) {
  const [titleInput, setTitleInput] = useState(title);
  const [descriptionInput, setDescriptionInput] = useState(description);
  const [priceInput, setPriceInput] = useState(price);
  const [categoryInput, setCategoryInput] = useState(category);
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState(imageUrls || []); // Added state for images currently in the post for display in the form
  const [deletedImages, setDeletedImages] = useState([]);
  const [discountedPriceInput, setDiscountedPriceInput] = useState(discountedPrice);
  const [soldInput, setSoldInput] = useState(sold);
  const [sellingLink, setSellingLink] = useState(selling_link);

  // const [numFilesSelected, setNumFilesSelected] = useState(0);

  const [files, setFiles] = useState([]);
  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the files
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/*' });

  // Display thumbnails
  const thumbs = (
    <div className="thumbnails-container">
      {/* Display newly selected files */}
      {files.map((file, index) => (
        <div key={file.name} className="thumbnail-wrapper">
          <img src={file.preview} alt={`New image ${index + 1}`} className="thumbnail" />
          <button
            type="button"
            className="delete-button-form"
            onClick={(e) => {
              e.preventDefault();
              handleImageDelete(index);
            }}
          >
            X
          </button>
        </div>
      ))}
      {/* Display current images */}
      {currentImages.map((url, index) => (
        <div key={url} className="thumbnail-wrapper">
          <img src={url} alt={`Current image ${index + 1}`} className="thumbnail" />
          <button
            type="button"
            className="delete-button-form"
            onClick={(e) => {
              e.preventDefault();
              handleImageDelete(files.length + index);
            }}
          >
            X
          </button>
        </div>
      ))}
    </div>
  );

  let newOrEdit = '';
  let formFunctionMode = '';
  if (title) {
    newOrEdit = 'Edit Post';
    formFunctionMode = 'edit';
  } else {
    newOrEdit = 'New Gallery Post';
    formFunctionMode = 'new';
  }

  const handleImageDelete = (index) => {
    // Deleting a newly uploaded file
    if (index < files.length) {
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    } else {
      // Deleting an existing image
      // Adjust the index to target the correct image in currentImages
      const currentIndex = index - files.length;
      setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== currentIndex));

      // If you need to track which existing images have been deleted
      const deletedImageUrl = currentImages[currentIndex];
      setDeletedImages((prevDeletedImages) => [...prevDeletedImages, deletedImageUrl]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postDetails = {
        title: titleInput,
        description: descriptionInput,
        price: priceInput,
        category: categoryInput,
        author_id: user.id,
        num_imgs: files.length,
        discountedPrice: discountedPriceInput,
        sold: soldInput,
        link: sellingLink,
      };

      // Upload new images to Cloudinary and get their URLs + post details
      const newPost = {
        ...(await uploadImagesAndCreatePost(files, formFunctionMode)),
        ...postDetails,
      };

      // pass new post and images to parent component
      submitHandler(newPost, currentImages, deletedImages);
    } catch (error) {
      console.error(error);
    }
  };

  // handle category change and update state
  const handleCategoryChange = (event) => {
    setCategoryInput(event.target.value);
  };

  // show loading spinner while waiting for posts to load
  if (loading) {
    return <Loading />;
  }
  const handleClick = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <>
      <div className="form-wrapper">
        <aside className="form-admin-panel ">
          <section className="form-admin-panel-section ">
            <div className="">
              <Menu handleClick={handleClick} />
            </div>
          </section>
        </aside>

        <form className="new-post-form" onSubmit={handleFormSubmit} encType="multipart/form-data">
          <h1 id="form-title-header">{newOrEdit}</h1>
          <div className="desk-cat-input">
            <span className="labels-form-inputs">Category</span>
            <select
              id="category"
              value={categoryInput}
              onChange={handleCategoryChange}
              className="image-input shadow-border"
              required
            >
              <option value="" disabled>
                Choose category
              </option>
              <option value="Beads">Beads</option>
              <option value="Blunt Tips">Blunt Tips</option>
              <option value="Bubblers">Bubblers</option>
              <option value="Collabs">Collabs</option>
              <option value="Cups">Cups</option>
              <option value="Dry Pieces">Dry Pieces</option>
              <option value="Goblets">Goblets</option>
              <option value="Iso Stations">Iso Stations</option>
              <option value="Marbles">Marbles</option>
              <option value="Pendants">Pendants</option>
              <option value="Recyclers">Recyclers</option>
              <option value="Rigs">Rigs</option>
              <option value="Slides">Slides</option>
              <option value="Spinner Caps">Spinner Caps</option>
              <option value="Terp Pearls">Terp Pearls</option>
              <option value="Tubes">Tubes</option>
              <option value="Misc">Misc</option>
            </select>
          </div>
          <div className="desk-title-input">
            <span className="labels-form-inputs">Title</span>

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
          <div className="desk-desc-input">
            <span className="labels-form-inputs"> Description</span>
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
          <div className="price-in-form">
            <span>Price</span>
            {/*  Price */}
            <input
              required
              placeholder="Enter price"
              className="image-input  price-input"
              type="number"
              step="1"
              name="price"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
            />{' '}
            {/* <span className="dollar-sign-span">$</span> */}
          </div>
          <div className="price-in-form">
            <span>Discount Price</span>
            <input
              placeholder="Enter discounted price"
              className="image-input  price-input"
              type="number"
              step="1"
              name="discountedPrice"
              value={discountedPriceInput}
              onChange={(e) => setDiscountedPriceInput(e.target.value)}
            />
          </div>
          <div className="price-in-form selling-link">
            <span>GlassPass || Etsy || Insta Link:</span>
            <input
              placeholder="GP or Etsy or IG"
              className="image-input  price-input"
              type="text"
              step="1"
              name="link"
              value={sellingLink}
              style={{ textAlign: 'left' }}
              onChange={(e) => setSellingLink(e.target.value)}
            />
          </div>
          <div className="sold-radio-group">
            <span className="labels-form-inputs">Sold Status</span>
            <label className="radio-label">
              <input
                type="radio"
                value="true"
                checked={soldInput === true}
                onChange={() => setSoldInput(true)}
              />
              Sold
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="false"
                checked={soldInput === false}
                onChange={() => setSoldInput(false)}
              />
              Available
            </label>
          </div>
          <div {...getRootProps()} className="dropzone image-input-button">
            <input {...getInputProps()} />
            <label className="file-upload-label">
              {files.length === 0
                ? 'Choose images or videos'
                : `${files.length} file${files.length > 1 ? 's' : ''} selected`}
            </label>
          </div>
          {files.length > 0 || currentImages?.length > 0 ? thumbs : null}
          <div className="btn-container">
            <button className="submit-btn" type="submit">
              {<img className="upload-icon " src="/upload.png" alt="upload" />}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
