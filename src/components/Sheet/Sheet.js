import { useEffect, useRef } from 'react';
import './Sheet.css';

const Sheet = ({ title, isOpen, onClose, children }) => {
  const dialog = useRef(null);

  useEffect(() => {
    const sheet = dialog.current;
    if (!sheet) return;

    if (isOpen && !sheet.open) sheet.showModal();
    if (!isOpen && sheet.open) sheet.close();
  }, [isOpen]);

  const handleClick = (event) => {
    if (event.target === dialog.current) onClose();
  };

  return (
    <dialog ref={dialog} className="bottom-sheet" onClose={onClose} onClick={handleClick}>
      <div className="bottom-sheet-header">
        <h2 className="bottom-sheet-title">{title}</h2>
        <button type="button" className="bottom-sheet-done-button" onClick={onClose}>
          Done
        </button>
      </div>

      <div className="bottom-sheet-content">{children}</div>
    </dialog>
  );
};

export default Sheet;
