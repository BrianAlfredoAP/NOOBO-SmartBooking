import { demoLogistikUser } from './logistik-demo.js'

// Frontend-only demo credentials. Never use these accounts or client-side checks in production.
export const demoUser = Object.freeze({
  name: 'Aria Restu',
  email: 'mahasiswa@kampus.ac.id',
  password: '12345678',
  role: 'peminjam',
  roleLabel: 'Mahasiswa · Peminjam',
  organization: 'UKM Kampus',
  initials: 'AR',
})

export function validateDemoLoginInput({ email, password }) {
  const errors = {}
  const normalizedEmail = email.trim()

  if (!normalizedEmail) errors.email = 'Email wajib diisi.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = 'Masukkan alamat email dengan format yang valid.'
  }

  if (!password) errors.password = 'Kata sandi wajib diisi.'
  return errors
}

export function checkDemoCredentials({ email, password, role }) {
  const account = role === 'logistik' ? demoLogistikUser : role === demoUser.role ? demoUser : null
  if (!account) return { ok: false, reason: 'role-unavailable' }
  const validEmail = email.trim().toLowerCase() === account.email.toLowerCase()
  const validPassword = password === account.password
  return validEmail && validPassword
    ? { ok: true, user: { name: account.name, email: account.email, role: account.role } }
    : { ok: false, reason: 'invalid-credentials' }
}
