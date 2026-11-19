import { useId, useState } from 'react'
import { ArrowRight, Building2, Eye, EyeOff, UserRound } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { checkDemoCredentials, demoUser, validateDemoLoginInput } from '../../data/demo-user.js'
import { demoLogistikUser } from '../../data/logistik-demo.js'
import { useAuth } from '../../context/auth-context.js'
import { Navigate, useNavigate } from 'react-router'
import nooboLogo from '../../assets/logo.png'

const roles = [
  { id: 'peminjam', label: 'Peminjam', icon: UserRound },
  { id: 'logistik', label: 'Logistik Kampus', icon: Building2 },
]

function LoginPage() {
  const [role, setRole] = useState('peminjam')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const [loginMessageError, setLoginMessageError] = useState(false)
  const [helpMessage, setHelpMessage] = useState('')
  const { user, startDemoSession } = useAuth()
  const navigate = useNavigate()
  const passwordId = useId()
  const passwordErrorId = `${passwordId}-error`

  const validationErrors = validateDemoLoginInput({ email, password })
  const emailError = validationErrors.email ?? ''
  const passwordError = validationErrors.password ?? ''
  const formValid = Object.keys(validationErrors).length === 0

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    setLoginMessage('')
    if (!formValid || loading) return

    const submittedEmail = email
    const submittedPassword = password
    const submittedRole = role
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      const result = checkDemoCredentials({ email: submittedEmail, password: submittedPassword, role: submittedRole })
      if (!result.ok) {
        setLoginMessageError(true)
        setLoginMessage('Email atau kata sandi tidak sesuai dengan akun demonstrasi.')
      } else {
        startDemoSession(result.user)
        navigate(result.user.role === 'logistik' ? '/logistik' : '/peminjam', { replace: true })
      }
      setPassword('')
      setPasswordTouched(false)
    }, 550)
  }

  if (user?.role === 'peminjam') return <Navigate to="/peminjam" replace />
  if (user?.role === 'logistik') return <Navigate to="/logistik" replace />

  return (
    <main className="auth-page">
      <header className="auth-header">
        <img
          src={nooboLogo}
          alt="NOOBO"
          className="auth-logo"
        />
        <p className="auth-tagline">Easy Book, Easy Use</p>
      </header>

      <section aria-label="Form login NOOBO" className="auth-panel">
        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <fieldset className="auth-role-group">
            <legend>Masuk sebagai</legend>
            <div className="auth-role-options">
              {roles.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  aria-pressed={role === id}
                  className={`auth-role-option ${role === id ? 'is-selected' : ''}`}
                  disabled={loading}
                  onClick={() => {
                    setRole(id)
                    setLoginMessage('')
                    setLoginMessageError(false)
                  }}
                  type="button"
                >
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <Input
            autoComplete="username"
            error={submitted || emailTouched ? emailError : ''}
            label="Email"
            onBlur={() => setEmailTouched(true)}
            onChange={(event) => {
              setEmail(event.target.value)
              setLoginMessage('')
              setLoginMessageError(false)
            }}
            placeholder={role === 'logistik' ? demoLogistikUser.email : demoUser.email}
            required
            type="email"
            value={email}
          />
          <div className="form-field auth-password-field">
            <label className="form-field__label" htmlFor={passwordId}>
              Kata sandi <span aria-hidden="true"> *</span>
            </label>
            <div className="auth-password-control">
              <input
                id={passwordId}
                aria-describedby={(submitted || passwordTouched) && passwordError ? passwordErrorId : undefined}
                aria-invalid={(submitted || passwordTouched) && passwordError ? 'true' : undefined}
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                className={`form-control auth-password-input ${(submitted || passwordTouched) && passwordError ? 'form-control--error' : ''}`}
                onBlur={() => setPasswordTouched(true)}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setLoginMessage('')
                  setLoginMessageError(false)
                }}
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                aria-pressed={showPassword}
                className="auth-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {(submitted || passwordTouched) && passwordError && <p className="form-field__message form-field__message--error" id={passwordErrorId}>{passwordError}</p>}
          </div>

          <Button
            className="auth-submit"
            disabled={!formValid || loading}
            size="lg"
            type="submit"
          >
            <span>{loading ? 'Memeriksa…' : 'Login'}</span>
            {!loading && <ArrowRight size={17} aria-hidden="true" />}
          </Button>

          <p aria-live="polite" className={`auth-feedback ${loginMessageError ? 'is-error' : ''}`}>
            {loginMessage}
          </p>
        </form>

        <p className="auth-help">
          <span>Butuh Bantuan?</span>{' '}
          <button className="auth-help-link" onClick={() => setHelpMessage('Kontak layanan bantuan belum tersedia.')} type="button">
            Kontak Kami
          </button>
        </p>
        {helpMessage && <p className="auth-help-feedback" role="status">{helpMessage}</p>}
      </section>
    </main>
  )
}

export default LoginPage
