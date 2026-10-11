import { useState } from 'react';
import IosShareIcon from '@mui/icons-material/IosShare';
import './ShareButton.css';

// Video posts store a matching .jpg poster frame alongside the .mp4.
const posterFor = (source) => (source?.endsWith('.mp4') ? source.replace('.mp4', '.jpg') : source);

const ShareButton = ({ imageUrl, title, text, variant = 'compact', className = '' }) => {
  const [status, setStatus] = useState('idle');
  const [shareErrorName, setShareErrorName] = useState('');

  // Sharing a bare URL lands in Instagram DMs, not Stories — Stories only
  // accepts a file. So pull the image down and share that when we can.
  const buildImageFile = async () => {
    const source = posterFor(imageUrl);
    if (!source) return null;

    // The page has already shown this image through <img>, and that cached copy
    // carries no CORS header. The query string gives this fetch its own browser
    // cache entry; CloudFront ignores it and serves the same file. Not
    // `cache: 'no-store'`: that sends Cache-Control: no-cache, and CloudFront
    // then leaves the CORS header off.
    const response = await fetch(`${source}?share`);
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

      // Temporary while testing on the phone, where there is no console: the
      // label names the error, even when the clipboard fallback is refused too.
      setShareErrorName(error.name);
      setTimeout(() => setStatus('idle'), 5000);

      try {
        await navigator.clipboard.writeText(pageUrl);
        setStatus('copied');
      } catch {
        setStatus('failed');
      }
    }
  };

  // No share sheet at all (desktop Firefox) — nothing useful to render.
  if (!navigator.share) return null;

  const idleLabel = variant === 'full' ? 'Share this piece' : 'Share';
  const label =
    status === 'copied'
      ? `Link copied: ${shareErrorName}`
      : status === 'failed'
        ? `Share failed: ${shareErrorName}`
        : idleLabel;

  return (
    <button
      type="button"
      className={`share-button share-button--${variant} ${className}`.trim()}
      onClick={handleShare}
      aria-label={`Share ${title}`}
    >
      <IosShareIcon fontSize="small" />
      <span className="share-button-label">{label}</span>
    </button>
  );
};

export default ShareButton;
