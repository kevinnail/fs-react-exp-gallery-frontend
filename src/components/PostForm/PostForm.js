import { useEffect } from 'react';
import { useState } from 'react';
import { useUser } from '../../hooks/useUser.js';
// import { getPostDetail, uploadImagesAndCreatePost } from '../../services/fetch-utils.js';
import { uploadImagesAndCreatePost } from '../../services/fetch-utils.js';
// import { usePosts } from '../../hooks/usePosts.js';
import './PostForm.css';

export default function PostForm({
  title = '',
  description = '',
  price = '',
  category = '',
  submitHandler,
  imageUrls,
  additionalImages = [],
  deletedImagePublicIds,
  setDeletedImagePublicIds,
}) {
  const [titleInput, setTitleInput] = useState(title);
  const [descriptionInput, setDescriptionInput] = useState(description);
  const [imageFilesInput, setImageFilesInput] = useState([]);
  const [priceInput, setPriceInput] = useState(price);
  const [categoryInput, setCategoryInput] = useState(category);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState(imageUrls || []); // Added state for images currently in the post for display in the form
  const [newImageDataURLs, setNewImageDataURLs] = useState([]); // <--- these are for new posts for display in the form
  // const [newImages, setNewImages] = useState([]); // <--- these are for new posts for gallery display and storage in the db
  // new vvvvvvvvvvvvvvvvvvvvvvvvvv
  const [deletedImages, setDeletedImages] = useState([]);

  const getDisplayImages = () => {
    return [...newImageDataURLs, ...currentImages];
  };
  // new ^^^^^^^^^^^^^^^^^^
  // set up state for proper submit
  // const newOrEdit = title ? 'Edit Post' : 'New Gallery Post'; // if there is a title, it's an edit, otherwise it's a new post
  let newOrEdit = '';
  let formFunctionMode = '';
  if (title) {
    newOrEdit = 'Edit Post';
    formFunctionMode = 'edit';
  } else {
    newOrEdit = 'New Gallery Post';
    formFunctionMode = 'new';
  }

  // combine current images and new images into one array for display in the form
  // const combinedImageURLs = [...(newImageDataURLs || []), ...(imageUrls || [])];  // onto something

  // handle and parse images for display in the form onChange
  const handleFileInputChange = (event) => {
    setImageFilesInput([...event.target.files]);
    readAndPreview(event.target.files);
  };

  // new vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

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

  // new ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

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
      console.log('post', newPost);

      // console.log('postDetails in PostForm just before submitHandler', postDetails);

      // setNewImages(newPost.additionalImages) or something... and then use that in the submitHandler
      // Update the post's image URLs in your database by combining the currentImages and the new image URLs, and removing the removedImages URLs
      //
      //

      // Delete removed images from Cloudinary using their URLs
      //
      //

      // Call submitHandler with the updated data
      //
      //
      // console.log('newImages before submitHandler', newImages);
      // console.log('newImages before submitHandler', newImages);
      // console.log('setCurrentImages before submitHandler', setCurrentImages);

      submitHandler(newPost, currentImages, deletedImages, setDeletedImages);
    } catch (error) {
      console.error(error);
    } finally {
      // setLoading(false);
    }
  };

  // handle category change and update state
  const handleCategoryChange = (event) => {
    setCategoryInput(event.target.value);
  };

  // handle form input changes and update state for display on form
  const readAndPreview = (files) => {
    const urls = [];
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (event) => {
        urls.push(event.target.result);
        setNewImageDataURLs(urls);
      };

      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="loading-div">
        <img className="loading" src="../logo-sq.png" />
      </div>
    );
  }
  return (
    <>
      <form className="new-post-form" onSubmit={handleFormSubmit} encType="multipart/form-data">
        <h1 id="form-title-header">{newOrEdit}</h1>
        <div>
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
        <div>
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

        <div className="input-wrapper">
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
          <span
            style={{
              position: 'relative',
              left: '-300px',
              top: '0',
              transform: 'translateX(50%)',
              display: 'inline',
            }}
          >
            $
          </span>
        </div>

        <div>
          <br />
          <input
            // required
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
              <img
                key={index}
                className="thumbnail"
                src={url}
                alt={`Selected image ${index + 1}`}
                onClick={() => {
                  handleImageDelete(index);
                  // console.log('newImageDataURLs.length: ', newImageDataURLs.length);
                  // console.log('getDisplayImages().length: ', getDisplayImages().length);
                  // if (index < newImageDataURLs.length) { //  onto something
                  // console.log('if fired, index: ', index);
                  // setNewImageDataURLs((prevDataURLs) => //  onto something
                  //   prevDataURLs.filter((_, i) => i !== index) //  onto something
                  // ); //  onto something
                  // } else {  //  onto something
                  // console.log('else fired, index: ', index);
                  // setCurrentImages((currentImages) => { //  onto something
                  // console.log('currentImages BEFORE: ', currentImages);
                  // const newCurrentImages = [...currentImages];
                  // newCurrentImages.splice(index - newImageDataURLs.length, 1);
                  // console.log('currentImages after setCurrentImages: ', currentImages);
                  // currentImages.splice(index - newImageDataURLs.length, 1);   //  onto something
                  //
                  //
                  // STOPPING POINT currently working to delete image JUST from display in form,
                  // after that needs to be deleted from database and cloudinary
                  //
                  //
                  // newCurrentImages.filter((_, i) => i !== index);
                  // console.log('newCurrentImages: ', newCurrentImages);
                  // setCurrentImages(newCurrentImages);
                  console.log('currentImages: ', currentImages);
                  // return newCurrentImages;
                  // }); //  onto something
                  // } //  onto something
                }}
              />
            ))}
          </div>
        ) : null}
        <div className="btn-container">
          <button className="submit-btn" type="submit">
            {<img className="upload-icon " src="/upload.png" alt="upload" />}
          </button>
        </div>
      </form>
      {/* )} */}
    </>
  );
}
