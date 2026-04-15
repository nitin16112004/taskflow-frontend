import "./Modal.css";

export default function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <section className="modal-box" onClick={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <h3>{title}</h3>
          <button onClick={onClose} aria-label="close modal">
            ✕
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}