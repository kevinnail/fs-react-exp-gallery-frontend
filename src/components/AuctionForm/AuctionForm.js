import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../Loading/Loading.js';
import './AuctionForm.css';
import { createAuction, getAuctionDetail, updateAuction } from '../../services/fetch-auctions.js';
import { uploadAuctionImagesToS3 } from '../../services/fetch-auctions.js';
import { useNavigate, useParams } from 'react-router-dom';

const TITLE_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 400;

export default function AuctionForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const [existingAuction, setExistingAuction] = useState({});

  const [existingImages, setExistingImages] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const auctionData = async () => {
        const currentAuction = await getAuctionDetail(id);
        setExistingAuction(currentAuction);

        // Pre-fill controlled inputs
        setTitle(currentAuction.title || '');
        setDescription(currentAuction.description || '');
        setExistingImages(currentAuction.imageUrls || []);
        setStartPrice(currentAuction.startPrice || '');
        setBuyNowPrice(currentAuction.buyNowPrice || '');

        if (currentAuction.endTime) {
          let formattedEndTime = '';
          if (currentAuction.endTime) {
            formattedEndTime = new Date(currentAuction.endTime)
              .toLocaleString('sv-SE', { timeZone: 'America/Los_Angeles' })
              .replace(' ', 'T')
              .slice(0, 16);
          }
          setEndTime(formattedEndTime);
        } else {
          setEndTime('');
        }
      };
      auctionData();
    }
  }, [id]);

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 10,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload new files to S3 (if any)
      let uploadedUrls = [];
      if (files.length > 0) {
        const uploaded = await uploadAuctionImagesToS3(files);
        uploadedUrls = uploaded.map((img) => img.secure_url);
      }

      // 2. Merge existing + newly uploaded images
      const finalImageUrls = [...existingImages, ...uploadedUrls];

      // 3. Build payload
      const payload = {
        title,
        description,
        startPrice: parseInt(startPrice),
        buyNowPrice: buyNowPrice ? parseInt(buyNowPrice) : null,
        endTime: new Date(endTime).toISOString(),
        startTime: existingAuction?.startTime
          ? new Date(existingAuction.startTime).toISOString()
          : new Date().toISOString(),
        imageUrls: finalImageUrls,
        currentBid: existingAuction?.currentBid || 0,
      };

      // 4. Send payload — choose create vs. update based on id
      id ? await updateAuction(id, payload) : await createAuction(payload);

      toast.success(id ? 'Auction updated successfully' : 'Auction created successfully', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        toastId: id ? 'auction-update' : 'auction-create',
        autoClose: true,
      });

      // 5. Reset form after success (optional for editing)
      if (!id) {
        setTitle('');
        setDescription('');
        setStartPrice('');
        setBuyNowPrice('');
        setEndTime('');
        setFiles([]);
        setExistingImages([]);
      }
      navigate('/auctions');
    } catch (err) {
      console.error(err);
      toast.error(`Error saving auction: ${err.message}`, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-error',
        autoClose: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages((previous) =>
      previous.filter((_unused, imageIndex) => imageIndex !== indexToRemove)
    );
  };

  const removeNewFile = (indexToRemove) => {
    setFiles((previous) => previous.filter((_unused, fileIndex) => fileIndex !== indexToRemove));
  };

  if (loading) return <Loading />;

  const totalImageCount = existingImages.length + files.length;
  const hasBids = Number(existingAuction?.currentBid) > 0;

  return (
    <div className="admin-form-page">
      {/* A div rather than a <header>: Header.css styles the bare `header`
          element as the site's fixed nav bar. */}
      <div className="admin-form-header">
        <p className="slg-eyebrow">{id ? 'Auctions / Edit' : 'Auctions'}</p>
        <h1 className="admin-form-title">{id ? 'Edit Auction' : 'New Auction'}</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-column">
          <p className="admin-form-section-heading">Lot</p>

          {hasBids && (
            <p className="slg-auction-warning">
              <strong>Live</strong>
              <span>
                This auction already has bids at $
                {Number(existingAuction.currentBid).toLocaleString()}. Changing the price or closing
                time changes terms bidders have already committed to.
              </span>
            </p>
          )}

          <div className="form-field">
            <label className="form-field-label" htmlFor="auction-title">
              Title
              <span
                className={`form-field-character-count${
                  title.length === TITLE_MAX_LENGTH ? ' form-field-character-count--at-limit' : ''
                }`}
              >
                {title.length}/{TITLE_MAX_LENGTH}
              </span>
            </label>
            <input
              id="auction-title"
              className="form-input"
              type="text"
              placeholder="Enter auction title"
              maxLength={TITLE_MAX_LENGTH}
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-field-label" htmlFor="auction-description">
              Description
              <span
                className={`form-field-character-count${
                  description.length === DESCRIPTION_MAX_LENGTH
                    ? ' form-field-character-count--at-limit'
                    : ''
                }`}
              >
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </label>
            <textarea
              id="auction-description"
              className="form-textarea"
              placeholder="Enter auction description"
              maxLength={DESCRIPTION_MAX_LENGTH}
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-field-pair">
            <div className="form-field">
              <label className="form-field-label" htmlFor="auction-start-price">
                Start price
              </label>
              <div className="form-money-input-wrapper">
                <input
                  id="auction-start-price"
                  className="form-input"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={startPrice ?? ''}
                  onChange={(e) => setStartPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-field-label" htmlFor="auction-buy-now-price">
                Buy now
              </label>
              <div className="form-money-input-wrapper">
                <input
                  id="auction-buy-now-price"
                  className="form-input"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={buyNowPrice ?? ''}
                  onChange={(e) => setBuyNowPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="form-field-label" htmlFor="auction-end-time">
              Closing time
            </label>
            <input
              id="auction-end-time"
              className="form-input"
              type="datetime-local"
              value={endTime || ''}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
            <p className="form-field-hint">
              Bidding closes at this time and the winner is notified automatically.
            </p>
          </div>
        </div>

        <div className="admin-form-column">
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
                : `${files.length} file${files.length > 1 ? 's' : ''} added`}
            </span>
            <span className="form-image-dropzone-file-types">JPG or PNG — up to 10</span>
          </div>

          {totalImageCount > 0 && (
            <p className="form-field-hint">
              {totalImageCount} image{totalImageCount > 1 ? 's' : ''} on this auction
            </p>
          )}

          {totalImageCount > 0 && (
            <div className="form-image-previews">
              {existingImages.map((imageUrl, index) => (
                <div key={imageUrl} className="form-image-preview">
                  <img src={imageUrl} alt={`Current image ${index + 1}`} />
                  {index === 0 && <span className="form-image-preview-lead-badge">Lead</span>}
                  <button
                    type="button"
                    className="form-image-preview-remove-button"
                    aria-label={`Remove current image ${index + 1}`}
                    onClick={(event) => {
                      event.preventDefault();
                      removeExistingImage(index);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {files.map((file, index) => (
                <div key={file.name} className="form-image-preview">
                  <img src={file.preview} alt={`New image ${index + 1}`} />
                  {existingImages.length === 0 && index === 0 && (
                    <span className="form-image-preview-lead-badge">Lead</span>
                  )}
                  <button
                    type="button"
                    className="form-image-preview-remove-button"
                    aria-label={`Remove new image ${index + 1}`}
                    onClick={(event) => {
                      event.preventDefault();
                      removeNewFile(index);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-form-actions">
          <button className="admin-form-submit-button" type="submit">
            {id ? 'Save changes' : 'Create auction'}
          </button>
        </div>
      </form>
    </div>
  );
}
