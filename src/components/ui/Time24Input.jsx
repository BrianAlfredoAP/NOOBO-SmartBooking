import { useState } from 'react'
import { isValidTime24, parseTime24Draft } from '../../utils/time-format.js'

function Time24Input({ label, value, onChange, error = '', id, required = false, ariaLabel }) {
  const [draft, setDraft] = useState(value)
  const [formatError, setFormatError] = useState('')
  const inputId = id ?? `time-${label.toLowerCase().replace(/\s+/g, '-')}`
  const errorId = `${inputId}-error`
  const visibleError = formatError || error

  const handleChange = (event) => {
    const parsed = parseTime24Draft(event.target.value)
    setDraft(parsed.display)
    setFormatError(parsed.error)
    onChange(parsed.value)
  }

  const handleBlur = () => {
    if (draft && !isValidTime24(draft)) {
      setFormatError('Masukkan waktu lengkap dalam format HH:mm, misalnya 13:30.')
    }
  }

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={inputId}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <input
        id={inputId}
        aria-label={ariaLabel ?? label}
        aria-describedby={visibleError ? errorId : undefined}
        aria-invalid={visibleError ? 'true' : undefined}
        className={`form-control time24-input ${visibleError ? 'form-control--error' : ''}`}
        inputMode="numeric"
        maxLength={5}
        onBlur={handleBlur}
        onChange={handleChange}
        pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
        placeholder="HH:mm"
        required={required}
        type="text"
        value={draft}
      />
      {visibleError && <p className="form-field__message form-field__message--error" id={errorId}>{visibleError}</p>}
      {!visibleError && <p className="form-field__message">Format 24 jam</p>}
    </div>
  )
}

export default Time24Input
