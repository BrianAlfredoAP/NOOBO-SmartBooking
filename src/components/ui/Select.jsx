import { useId } from 'react'
import { ChevronDown } from 'lucide-react'

function Select({ label, hint, error, id, required, children, className = '', ...props }) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const messageId = `${selectId}-message`
  const message = error || hint

  return (
    <div className="form-field">
      {label && (
        <label className="form-field__label" htmlFor={selectId}>
          {label}{required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <div className="select-wrap">
        <select
          id={selectId}
          className={`form-control form-control--select ${error ? 'form-control--error' : ''} ${className}`.trim()}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={message ? messageId : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} aria-hidden="true" className="select-wrap__icon" />
      </div>
      {message && (
        <p id={messageId} className={`form-field__message ${error ? 'form-field__message--error' : ''}`}>
          {message}
        </p>
      )}
    </div>
  )
}

export default Select
