import { useState } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { uploadImagesAndCreatePost } from '../../services/fetch-utils.js';
import './PostForm.css';
import Menu from '../Menu/Menu.js';
import { signOut } from '../../services/auth.js';
import Loading from '../Loading/Loading.js';

export default function PostForm({
  title = '',
  description = '',
  price = '',
  category = '',
  submitHandler,
  imageUrls,
}) {
  const [titleInput, setTitleInput] = useState(title);
  const [descriptionInput, setDescriptionInput] = useState(description);
  const [imageFilesInput, setImageFilesInput] = useState([]);
  const [priceInput, setPriceInput] = useState(price);
  const [categoryInput, setCategoryInput] = useState(category);
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState(imageUrls || []); // Added state for images currently in the post for display in the form
  const [newImageDataURLs, setNewImageDataURLs] = useState([]); // <--- these are for new posts for display in the form
  const [deletedImages, setDeletedImages] = useState([]);

  const getDisplayImages = () => {
    return [...newImageDataURLs, ...currentImages];
  };

  let newOrEdit = '';
  let formFunctionMode = '';
  if (title) {
    newOrEdit = 'Edit Post';
    formFunctionMode = 'edit';
  } else {
    newOrEdit = 'New Gallery Post';
    formFunctionMode = 'new';
  }

  // handle and parse images for display in the form onChange
  const handleFileInputChange = (event) => {
    setImageFilesInput([...event.target.files]);
    readAndPreview(event.target.files);
  };

  const handleImageDelete = (index) => {
    if (index < newImageDataURLs.length) {
      setNewImageDataURLs((prevDataURLs) => prevDataURLs.filter((_, i) => i !== index));
      setImageFilesInput((prevFiles) => prevFiles.filter((_, i) => i !== index));
    } else {
      setCurrentImages((prevImages) => {
        const newCurrentImages = prevImages.filter((_, i) => i !== index - newImageDataURLs.length);
        const removedImageUrl = prevImages[index - newImageDataURLs.length];
        setDeletedImages((prevDeletedImages) => [...prevDeletedImages, removedImageUrl]);
        return newCurrentImages;
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // if (newImages.length === 0 && currentImages.length === 0) {
    //   // Show an error message if no images are selected or displayed
    //   alert('Please select at least one image.');
    //   return;
    // }
    setLoading(true);

    try {
      const postDetails = {
        title: titleInput,
        description: descriptionInput,
        price: priceInput,
        category: categoryInput,
        author_id: user.id,
        num_imgs: imageFilesInput.length,
      };

      // Upload new images to Cloudinary and get their URLs + post details
      const newPost = {
        ...(await uploadImagesAndCreatePost(imageFilesInput, formFunctionMode)),
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

  // handle form input changes and update state for display on form /////////////////////////////////////////////////////vvvvvvvvvvvvvvvvvvvvvvvvvv
  const readAndPreview = async (files) => {
    const urls = await Promise.all(
      Array.from(files).map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target.result);
          };
          reader.readAsDataURL(file);
        });
      })
    );
    setNewImageDataURLs(urls);
  };
  // const readAndPreview = (files) => {
  //   const urls = [];
  //   for (const file of files) {
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       urls.push(event.target.result);
  //       setNewImageDataURLs(urls);
  //     };

  //     reader.readAsDataURL(file);
  //   }
  // };
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ^^^^^^^^^^^^^^^^^^^^^^^

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
            <br />
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
              <option value="Misc">Misc</option>
            </select>
          </div>
          <div className="desk-title-input">
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
          <div className="desk-desc-input">
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

          <div className="desk-price-input-wrapper">
            <div className="desk-price-input">
              <br />{' '}
              <input
                required
                placeholder="Enter price"
                className="image-input input-with-dollar-sign"
                type="number"
                step="1"
                name="price"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
              />{' '}
              <span className="dollar-sign-span">$</span>
            </div>
          </div>

          <div className="desk-image-input">
            <br />
            <input
              // required   // this doesn't work because the user can not need to upload a new image- maybe fix this?
              // Works just fine without it but would be better with a place holder image or required type functionality
              type="file"
              id="image"
              className="file-upload-btn shadow-border"
              name="image"
              onChange={handleFileInputChange}
              multiple
            />
          </div>
          {
            //display images selected for upload
          }
          {getDisplayImages().length > 0 ? (
            <div className="thumbnails-container">
              {getDisplayImages().map((url, index) => (
                <div key={index} className="thumbnail-wrapper">
                  <img className="thumbnail" src={url} alt={`Selected image ${index + 1}`} />
                  <button
                    type="button" // Add this to prevent the button from submitting the form
                    className="delete-button-form"
                    onClick={(e) => {
                      e.preventDefault(); // Add this to prevent the form from submitting
                      handleImageDelete(index);
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          ) : null}

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
