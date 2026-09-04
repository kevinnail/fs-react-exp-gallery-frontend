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
    <dialog ref={dialog} className="slg-sheet" onClose={onClose} onClick={handleClick}>
      <div className="slg-sheet-head">
        <h2 className="slg-sheet-title">{title}</h2>
        <button type="button" className="slg-sheet-close" onClick={onClose}>
          Done
        </button>
      </div>

      <div className="slg-sheet-body">{children}</div>
    </dialog>
  );
};

export default Sheet;
