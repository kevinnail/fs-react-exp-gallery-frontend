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
  getThumbnailUrl,
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

  const [numFilesSelected, setNumFilesSelected] = useState(0);

  // This function generates a thumbnail for the given video file
  const generateVideoThumbnail = async (file) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.preload = 'auto';
    video.muted = true;

    await new Promise((resolve) => {
      const checkVideoFrame = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          resolve();
        } else {
          requestAnimationFrame(checkVideoFrame);
        }
      };
      checkVideoFrame();
    });

    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    URL.revokeObjectURL(video.src);

    return thumbnailDataUrl;
  };

  // eslint-disable-next-line no-console
  // get all dataURLS and URLS from cloudinary images for display
  const getDisplayImages = () => {
    return [...newImageDataURLs, ...currentImages.map((imageUrl) => getThumbnailUrl(imageUrl))];
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
  const handleFileInputChange = async (event) => {
    const files = event.target.files;

    if (files.length === 0) {
      return;
    }

    setLoading(true);

    const newFiles = [];
    const newDataURLs = [];

    const promises = Array.from(files).map(async (file) => {
      // check if the selected file is a video and generate a thumbnail
      if (file.type.startsWith('video/')) {
        const thumbnail = await generateVideoThumbnail(file);
        newFiles.push(file);
        newDataURLs.push(thumbnail.url);
      } else {
        // handle image files normally
        newFiles.push(file);

        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onload = (event) => {
            newDataURLs.push(event.target.result);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    });

    await Promise.all(promises);

    setImageFilesInput(newFiles);
    setNewImageDataURLs(newDataURLs);
    setNumFilesSelected(newFiles.length); // Set the number of files selected
    setLoading(false);
  };

  const handleImageDelete = (index) => {
    // if the image is a newly created one...
    // filter out the deleted DataURL from newImageDataURLs array
    // by index which are used for display in the form
    // filter out the deleted image from the ImageFilesInput array so it's not uploaded
    if (index < newImageDataURLs.length) {
      setNewImageDataURLs((prevDataURLs) => prevDataURLs.filter((_, i) => i !== index));
      setImageFilesInput((prevFiles) => prevFiles.filter((_, i) => i !== index));
    } else {
      // if the image is an existing one...
      // filter out deleted image URL from currentImages and assign new array newCurrentImages
      // find URL of deleted image in CurrentImages and assign it to removedImagesUrl
      // append the newly deleted images with the deletedImages array
      // return new currentImages array
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
              className="file-upload-btn shadow-border visually-hidden"
              name="image"
              onChange={handleFileInputChange}
              multiple
            />
            <label htmlFor="image" className="file-upload-label">
              {numFilesSelected === 0
                ? 'Choose images or videos'
                : `${numFilesSelected} file${numFilesSelected > 1 ? 's' : ''} selected`}
            </label>
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
