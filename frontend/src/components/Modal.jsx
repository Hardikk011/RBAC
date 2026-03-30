import { useEffect, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import './Modal.css';

/**
 * Reusable modal overlay.
 * Props:
 *   isOpen: boolean
 *   onClose: function
 *   title: string
 *   children: form content
 */
export default function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null);

  // close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // close when clicking the dark overlay (not the card itself)
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
