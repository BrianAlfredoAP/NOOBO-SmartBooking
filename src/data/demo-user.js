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

export function checkDemoCredentials({ email, password }) {
  const validEmail = email.trim().toLowerCase() === demoUser.email.toLowerCase()
  const validPassword = password === demoUser.password
  return validEmail && validPassword
    ? { ok: true, user: { name: demoUser.name, email: demoUser.email, role: demoUser.role } }
    : { ok: false, reason: 'invalid-credentials' }
}
