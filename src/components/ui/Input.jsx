import { useId } from 'react'

function Input({ label, hint, error, id, required, className = '', ...props }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`
  const message = error || hint

  return (
    <div className="form-field">
      {label && (
        <label className="form-field__label" htmlFor={inputId}>
          {label}{required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`form-control ${error ? 'form-control--error' : ''} ${className}`.trim()}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={message ? messageId : undefined}
        {...props}
      />
      {message && (
        <p id={messageId} className={`form-field__message ${error ? 'form-field__message--error' : ''}`}>
          {message}
        </p>
      )}
    </div>
  )
}

export default Input
