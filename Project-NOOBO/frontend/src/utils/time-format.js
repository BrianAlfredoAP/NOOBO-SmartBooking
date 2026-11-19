export function isValidTime24(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

export function parseTime24Draft(input) {
  const digits = input.replace(/\D/g, '').slice(0, 4)
  const display = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits
  if (digits.length < 4) return { display, value: '', error: '' }
  if (isValidTime24(display)) return { display, value: display, error: '' }
  return { display, value: '', error: 'Jam harus 00–23 dan menit harus 00–59.' }
}

export function formatTime(value) {
  if (!isValidTime24(value)) return '—'
  return value.replace(':', '.')
}

export function formatTimeRange(startTime, endTime) {
  if (!isValidTime24(startTime) || !isValidTime24(endTime)) return 'Waktu belum lengkap'
  return `${formatTime(startTime)}–${formatTime(endTime)} WIB`
}

export function validateTimeRange(startTime, endTime) {
  if (!isValidTime24(startTime)) return { startTime: 'Gunakan format 24 jam HH:mm, misalnya 13:30.' }
  if (!isValidTime24(endTime)) return { endTime: 'Gunakan format 24 jam HH:mm, misalnya 15:30.' }
  if (endTime <= startTime) return { endTime: 'Waktu selesai harus setelah waktu mulai.' }
  return {}
}
