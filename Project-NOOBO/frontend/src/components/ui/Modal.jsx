import { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './Button.jsx'

function Modal({ open, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (!open) return undefined

    // Keep the page geometry stable while a fixed dialog is open.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose?.()
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`ui-modal ${className}`.trim()}
        role="dialog"
      >
        <header className="ui-modal__header">
          <h2 id="modal-title" className="ui-modal__title">{title}</h2>
          <Button
            aria-label="Tutup dialog"
            className="ui-modal__close"
            onClick={onClose}
            type="button"
            variant="tertiary"
          >
            <X size={18} aria-hidden="true" />
          </Button>
        </header>
        <div className="ui-modal__content">{children}</div>
      </section>
    </div>
  )
}

export default Modal
