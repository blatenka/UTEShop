import "../styles/ConfirmDialog.css";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";

function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isDangerous = false
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className={`confirm-dialog ${isDangerous ? "dangerous" : ""}`}>
        <div className="dialog-header">
          <FaExclamationTriangle className="dialog-icon" />
          <h2>{title}</h2>
        </div>
        
        <div className="dialog-body">
          <p>{message}</p>
        </div>

        <div className="dialog-actions">
          <button 
            className="btn-cancel"
            onClick={onCancel}
          >
            <FaTimes /> {cancelText}
          </button>
          <button 
            className={`btn-confirm ${isDangerous ? "dangerous" : ""}`}
            onClick={onConfirm}
          >
            <FaCheck /> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
