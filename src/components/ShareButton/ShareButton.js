import { useState } from 'react';
import IosShareIcon from '@mui/icons-material/IosShare';
import './ShareButton.css';

// Video posts store a matching .jpg poster frame alongside the .mp4.
const posterFor = (source) => (source?.endsWith('.mp4') ? source.replace('.mp4', '.jpg') : source);

const ShareButton = ({ imageUrl, title, text, variant = 'compact', className = '' }) => {
  const [status, setStatus] = useState('idle');

  // Sharing a bare URL lands in Instagram DMs, not Stories — Stories only
  // accepts a file. So pull the image down and share that when we can.
  const buildImageFile = async () => {
    const source = posterFor(imageUrl);
    if (!source) return null;

    const response = await fetch(source);
    if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);

    const blob = await response.blob();
    const fileName = source.split('/').pop() || 'piece.jpg';
    return new File([blob], fileName, { type: blob.type });
  };

  const handleShare = async () => {
    const pageUrl = window.location.href;

    try {
      const imageFile = await buildImageFile();

      if (imageFile && navigator.canShare?.({ files: [imageFile] })) {
        await navigator.share({ files: [imageFile], title, text: `${text} ${pageUrl}` });
        return;
      }

      await navigator.share({ title, text, url: pageUrl });
    } catch (error) {
      // Dismissing the share sheet is not a failure.
      if (error.name === 'AbortError') return;

      await navigator.clipboard.writeText(pageUrl);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  // No share sheet at all (desktop Firefox) — nothing useful to render.
  if (!navigator.share) return null;

  const label =
    status === 'copied' ? 'Link copied' : variant === 'full' ? 'Share this piece' : 'Share';

  return (
    <button
      type="button"
      className={`slg-share slg-share--${variant} ${className}`.trim()}
      onClick={handleShare}
      aria-label={`Share ${title}`}
    >
      <IosShareIcon fontSize="small" />
      <span className="slg-share-label">{label}</span>
    </button>
  );
};

export default ShareButton;
