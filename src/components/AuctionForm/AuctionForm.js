import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../Loading/Loading.js';
import './AuctionForm.css';
import { createAuction } from '../../services/fetch-auctions.js';
import { uploadAuctionImagesToS3 } from '../../services/fetch-auctions.js';

export default function AuctionForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiles) => {
    setFiles(
      acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) }))
    );
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 10,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
  });

  const handleImageDelete = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload each selected file to S3
      let uploadedUrls = [];
      if (files.length > 0) {
        const uploaded = await uploadAuctionImagesToS3(files);
        uploadedUrls = uploaded.map((img) => img.secure_url || img.url || img);
      }

      // 2. Build payload with those URLs
      const payload = {
        title,
        description,
        startPrice: parseInt(startPrice),
        buyNowPrice: buyNowPrice ? parseInt(buyNowPrice) : null,
        endTime: new Date(endTime),
        imageUrls: uploadedUrls,
        currentBid: 0,
        startTime: new Date(),
      };

      // 3. Send payload to your server
      const result = await createAuction(payload);

      toast.success('Auction created successfully', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-create',
        autoClose: false,
      });

      console.log('Auction created:', result);

      // 4. Reset form after success
      setTitle('');
      setDescription('');
      setStartPrice('');
      setBuyNowPrice('');
      setEndTime('');
      setFiles([]);
    } catch (err) {
      console.error(err);
      toast.error(`Error creating auction: ${err.message}`, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-error',
        autoClose: false,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box className="form-wrapper">
      <form className="new-post-form" onSubmit={handleSubmit}>
        <h1 id="form-title-header">New Auction</h1>

        <Box className="desk-title-input">
          <span className="labels-form-inputs">Title</span>
          <input
            required
            maxLength={80}
            placeholder="Enter auction title"
            className="image-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>

        <Box className="desk-desc-input">
          <span className="labels-form-inputs">Description</span>
          <textarea
            required
            maxLength={400}
            placeholder="Enter auction description"
            className="image-input description shadow-border"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>

        <Box className="price-in-form">
          <span>Start Price</span>
          <input
            required
            placeholder="Enter starting bid"
            className="image-input price-input"
            type="number"
            step="1"
            value={startPrice}
            onChange={(e) => setStartPrice(e.target.value)}
          />
        </Box>

        <Box className="price-in-form">
          <span>Buy Now Price</span>
          <input
            placeholder="Enter buy now price (optional)"
            className="image-input price-input"
            type="number"
            step="1"
            value={buyNowPrice}
            onChange={(e) => setBuyNowPrice(e.target.value)}
          />
        </Box>

        <Box className="price-in-form">
          <span>End Time</span>
          <input
            required
            className="image-input"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </Box>

        {/* Dropzone */}
        <Box {...getRootProps()} className="dropzone" sx={{ marginTop: '40px' }}>
          <input {...getInputProps()} />
          <label className="file-upload-label">
            {files.length === 0
              ? 'Choose images'
              : `${files.length} file${files.length > 1 ? 's' : ''} selected`}
          </label>
        </Box>

        {/* Thumbnails */}
        {files.length > 0 && (
          <Box className="thumbnails-container">
            {files.map((file, index) => (
              <Box key={file.name} className="thumbnail-wrapper">
                <img src={file.preview} alt={`Image ${index + 1}`} className="thumbnail" />
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
              </Box>
            ))}
          </Box>
        )}

        <Box className="btn-container">
          <button className="submit-btn" type="submit">
            <img className="upload-icon" src="/upload.png" alt="upload" />
          </button>
        </Box>
      </form>
    </Box>
  );
}
