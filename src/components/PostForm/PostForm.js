import { useCallback, useMemo, useState } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import { uploadImagesAndCreatePost } from '../../services/fetch-utils.js';
import Loading from '../Loading/Loading.js';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CATEGORIES = [
  'Beads',
  'Blunt Tips',
  'Bubblers',
  'Collabs',
  'Cups',
  'Droppers',
  'Dry Pieces',
  'Goblets',
  'Jars',
  'Iso Stations',
  'Marbles',
  'Pendants',
  'Recyclers',
  'Rigs',
  'Slides',
  'Spinner Caps',
  'Terp Pearls',
  'Tubes',
  'Vases',
  'Misc',
];

const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 350;

const SegmentedToggle = ({ name, value, onChange, options }) => (
  <div className="form-segmented-toggle">
    {options.map((option) => (
      <label
        key={String(option.value)}
        className={`form-segmented-toggle-option${value === option.value ? ' form-segmented-toggle-option--selected' : ''}`}
      >
        <input
          type="radio"
          name={name}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
        />
        {option.label}
      </label>
    ))}
  </div>
);

export default function PostForm({
  title = '',
  description = '',
  price = '',
  category = '',
  submitHandler,
  imageUrls,
  discountedPrice,
  sold = false, // Add default value for sold
  hide = false, // Add default value for hide
  selling_link = '',
}) {
  const [titleInput, setTitleInput] = useState(title);
  const [descriptionInput, setDescriptionInput] = useState(description);
  const [priceInput, setPriceInput] = useState(price);
  const [categoryInput, setCategoryInput] = useState(category);
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState(imageUrls || []); // Added state for images currently in the post for display in the form
  const [deletedImages, setDeletedImages] = useState([]);
  const [discountedPriceInput, setDiscountedPriceInput] = useState(discountedPrice);
  const [soldInput, setSoldInput] = useState(sold);
  const [hideInput, setHideInput] = useState(hide); // Add state for hide input
  const [sellingLink, setSellingLink] = useState(selling_link);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 20,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
  });

  // Display thumbnails
  const thumbs = useMemo(() => {
    if (loading || (files.length === 0 && currentImages.length === 0)) return null;

    return (
      <div className="form-image-previews">
        {files.map((file, index) => (
          <div key={file.name} className="form-image-preview">
            <img src={file.preview} alt={`New image ${index + 1}`} />
            {index === 0 && currentImages.length === 0 && (
              <span className="form-image-preview-lead-badge">Lead</span>
            )}
            <button
              type="button"
              className="form-image-preview-remove-button"
              aria-label={`Remove new image ${index + 1}`}
              onClick={(event) => {
                event.preventDefault();
                handleImageDelete(index);
              }}
            >
              ✕
            </button>
          </div>
        ))}
        {currentImages.map((url, index) => (
          <div key={url} className="form-image-preview">
            <img src={url} alt={`Current image ${index + 1}`} />
            {index === 0 && <span className="form-image-preview-lead-badge">Lead</span>}
            <button
              type="button"
              className="form-image-preview-remove-button"
              aria-label={`Remove current image ${index + 1}`}
              onClick={(event) => {
                event.preventDefault();
                handleImageDelete(files.length + index);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
    // eslint-disable-next-line
  }, [files, currentImages, loading]);

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
      setFiles((prevFiles) => prevFiles.filter((_unused, fileIndex) => fileIndex !== index));
    } else {
      // Deleting an existing image
      // Adjust the index to target the correct image in currentImages
      const currentIndex = index - files.length;
      setCurrentImages((prevImages) =>
        prevImages.filter((_unused, imageIndex) => imageIndex !== currentIndex)
      );

      // If you need to track which existing images have been deleted
      const deletedImageUrl = currentImages[currentIndex];
      setDeletedImages((prevDeletedImages) => [...prevDeletedImages, deletedImageUrl]);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
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
        hide: hideInput,
        link: sellingLink,
      };

      // Upload new images to S3 and get their URLs + post details
      const newPost = {
        ...(await uploadImagesAndCreatePost(files, formFunctionMode)),
        ...postDetails,
      };

      // pass new post and images to parent component
      submitHandler(newPost, currentImages, deletedImages);
    } catch (error) {
      console.error(error);
      toast.error(
        `Error ${formFunctionMode === 'new' ? 'creating new ' : 'editing '}post: ${error.message}`,
        {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'postForm-1',
          autoClose: false,
        }
      );
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

  const totalImageCount = files.length + currentImages.length;

  return (
    <div className="admin-form-page">
      <div className="admin-form-header">
        <p className="heading-label">{formFunctionMode === 'new' ? 'Gallery' : 'Gallery / Edit'}</p>
        <h1 className="admin-form-title">{newOrEdit}</h1>
      </div>

      <form className="admin-form" onSubmit={handleFormSubmit} encType="multipart/form-data">
        <div className="admin-form-column">
          <p className="admin-form-section-heading">Details</p>

          <div className="form-field">
            <label className="form-field-label" htmlFor="post-category">
              Category
            </label>
            <div className="form-select-wrapper">
              <select
                id="post-category"
                className="form-select"
                value={categoryInput}
                onChange={handleCategoryChange}
                required
              >
                <option value="" disabled>
                  Choose category
                </option>
                {CATEGORIES.map((categoryName) => (
                  <option key={categoryName} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-field-label" htmlFor="post-title">
              Title
              <span
                className={`form-field-character-count${
                  (titleInput || '').length === TITLE_MAX_LENGTH
                    ? ' form-field-character-count--at-limit'
                    : ''
                }`}
              >
                {(titleInput || '').length}/{TITLE_MAX_LENGTH}
              </span>
            </label>
            <input
              id="post-title"
              className="form-input"
              type="text"
              name="title"
              placeholder="Enter title"
              maxLength={TITLE_MAX_LENGTH}
              value={titleInput || ''}
              onChange={(event) => setTitleInput(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-field-label" htmlFor="post-description">
              Description
              <span
                className={`form-field-character-count${
                  (descriptionInput || '').length === DESCRIPTION_MAX_LENGTH
                    ? ' form-field-character-count--at-limit'
                    : ''
                }`}
              >
                {(descriptionInput || '').length}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </label>
            <textarea
              id="post-description"
              className="form-textarea"
              name="description"
              placeholder="Enter description"
              maxLength={DESCRIPTION_MAX_LENGTH}
              value={descriptionInput || ''}
              onChange={(event) => setDescriptionInput(event.target.value)}
              required
            />
          </div>

          <div className="admin-form-field-pair">
            <div className="form-field">
              <label className="form-field-label" htmlFor="post-price">
                Price
              </label>
              <div className="form-money-input-wrapper">
                <input
                  id="post-price"
                  className="form-input"
                  type="number"
                  step="1"
                  name="price"
                  placeholder="0"
                  value={priceInput ?? ''}
                  onChange={(event) => setPriceInput(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-field-label" htmlFor="post-discounted-price">
                Sale price
              </label>
              <div className="form-money-input-wrapper">
                <input
                  id="post-discounted-price"
                  className="form-input"
                  type="number"
                  step="1"
                  name="discountedPrice"
                  placeholder="0"
                  value={discountedPriceInput ?? ''}
                  onChange={(event) => setDiscountedPriceInput(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="form-field-label" htmlFor="post-selling-link">
              Selling link
            </label>
            <input
              id="post-selling-link"
              className="form-input"
              type="text"
              name="link"
              placeholder="GlassPass, Etsy or Instagram URL"
              value={sellingLink ?? ''}
              onChange={(event) => setSellingLink(event.target.value)}
            />
            <p className="form-field-hint">Where a buyer completes the purchase. Optional.</p>
          </div>
        </div>

        <div className="admin-form-column">
          <p className="admin-form-section-heading">Visibility</p>

          <div className="form-field">
            <span className="form-field-label">Sold status</span>
            <SegmentedToggle
              name="sold"
              value={soldInput}
              onChange={setSoldInput}
              options={[
                { value: false, label: 'Available' },
                { value: true, label: 'Sold' },
              ]}
            />
          </div>

          <div className="form-field">
            <span className="form-field-label">Gallery visibility</span>
            <SegmentedToggle
              name="hide"
              value={hideInput}
              onChange={setHideInput}
              options={[
                { value: false, label: 'Visible' },
                { value: true, label: 'Hidden' },
              ]}
            />
            <p className="form-field-hint">Hidden posts stay in the admin list only.</p>
          </div>

          <p className="admin-form-section-heading">Images</p>

          <div
            {...getRootProps({
              className: `form-image-dropzone${isDragActive ? ' form-image-dropzone--dragging' : ''}`,
            })}
          >
            <input {...getInputProps()} />
            <span className="form-image-dropzone-instructions">
              {files.length === 0
                ? 'Tap to choose images'
                : `${files.length} file${files.length > 1 ? 's' : ''} selected`}
            </span>
            <span className="form-image-dropzone-file-types">JPG or PNG — up to 10</span>
          </div>

          {totalImageCount > 0 && (
            <p className="form-field-hint">
              {totalImageCount} image{totalImageCount > 1 ? 's' : ''} on this post
            </p>
          )}

          {thumbs}
        </div>

        <div className="admin-form-actions">
          <button className="admin-form-submit-button" type="submit">
            {formFunctionMode === 'new' ? 'Create post' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
