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
  title = '',
  description = '',
  price = '',
  category = '',
  submitHandler,
  imageUrls,
  // getThumbnailUrl,
}) {
  const [titleInput, setTitleInput] = useState(title);
  const [descriptionInput, setDescriptionInput] = useState(description);
  // const [files, setfiles] = useState([]);
  const [priceInput, setPriceInput] = useState(price);
  const [categoryInput, setCategoryInput] = useState(category);
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState(imageUrls || []); // Added state for images currently in the post for display in the form
  // const [newImageDataURLs, setNewImageDataURLs] = useState([]); // <--- these are for new posts for display in the form
  const [deletedImages, setDeletedImages] = useState([]);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

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

  // This function generates a thumbnail for the given video file
  // const generateVideoThumbnail = async (videoFile) => {
  //   // This function generates a thumbnail for the given video file
  //   return new Promise((resolve) => {
  //     const video = document.createElement('video');
  //     const canvas = document.createElement('canvas');
  //     const context = canvas.getContext('2d');
  //     video.src = URL.createObjectURL(videoFile);

  //     // Wait for the video to be able to play through without stopping
  //     video.addEventListener('canplaythrough', () => {
  //       // Seek to 1 second into the video
  //       video.currentTime = 1;
  //     });

  //     video.addEventListener('seeked', () => {
  //       canvas.width = video.videoWidth;
  //       canvas.height = video.videoHeight;
  //       context.drawImage(video, 0, 0, canvas.width, canvas.height);
  //       const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
  //       resolve({ type: 'video', url: thumbnailUrl });
  //     });
  //   });
  // };

  // get all dataURLS and URLS from cloudinary images for display
  // const getDisplayImages = () => {
  //   return [...newImageDataURLs, ...currentImages.map((imageUrl) => getThumbnailUrl(imageUrl))];
  // };

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
  // const handleFileInputChange = async (event) => {
  //   const files = event.target.files;

  //   if (files.length === 0) {
  //     return;
  //   }

  //   setLoading(true);

  //   const newFiles = [];
  //   const newDataURLs = [];

  //   const promises = Array.from(files).map(async (file) => {
  //     // check if the selected file is a video and generate a thumbnail
  //     if (file.type.startsWith('video/')) {
  //       const thumbnail = await generateVideoThumbnail(file);
  //       newFiles.push(file);
  //       newDataURLs.push(thumbnail.url);
  //     } else {
  //       // handle image files normally
  //       newFiles.push(file);

  //       const reader = new FileReader();
  //       return new Promise((resolve) => {
  //         reader.onload = (event) => {
  //           newDataURLs.push(event.target.result);
  //           resolve();
  //         };
  //         reader.readAsDataURL(file);
  //       });
  //     }
  //   });

  //   await Promise.all(promises);

  //   setfiles(newFiles);
  //   setNewImageDataURLs(newDataURLs);
  //   setNumFilesSelected(newFiles.length); // Set the number of files selected
  //   setLoading(false);
  // };

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
        num_imgs: files.length,
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
          {/* <div className="desk-image-input"> */}
          <br />
          {/* <input
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
          ) : null}{' '} */}
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <label className="file-upload-label">
              {files.length === 0
                ? 'Choose images or videos'
                : `${files.length} file${files.length > 1 ? 's' : ''} selected`}
            </label>
          </div>
          {thumbs}
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
