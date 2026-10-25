import { useState, type FormEvent } from "react";
import glossyBlueGraduationEmblem2 from "../assets/glossy-blue-graduation-emblem-2.png";
import vector from "../assets/vector.png";
import image from "../assets/image.png";
import vector2 from "../assets/vector-2.png";
import vector3 from "../assets/vector-3.png";
import "../web.app/Login.css";

const accountTypes = [
  { id: "borrower", label: "Peminjam" },
  { id: "logistics", label: "Logistik Kampus" },
] as const;

export const Login = () => {
  const [accountType, setAccountType] = useState<(typeof accountTypes)[number]["id"]>("borrower");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (!email.trim() || !password) {
      window.alert("Silakan isi email dan kata sandi.");
      return;
    }
    // TODO: sambungkan ke backend untuk autentikasi
    window.alert("Fitur login akan segera tersedia setelah backend terhubung.");
  };

  return (
    <div className="ln-root">
      <div className="ln-inner">

        {/* ══ KOLOM KIRI — Logo ══ */}
        <div className="ln-left">
          <header aria-label="NOOBO" className="ln-logo-wrapper">
            <span className="ln-logo-n">N</span>
            <img
              src={glossyBlueGraduationEmblem2}
              alt="Logo topi wisuda NOOBO"
              className="ln-logo-cap"
            />
            <span className="ln-logo-bo">BO</span>
          </header>
          <p className="ln-tagline">Easy Book, Easy Use</p>
        </div>

        {/* ══ KOLOM KANAN — Card ══ */}
        <section aria-labelledby="login-heading" className="ln-card">

          {/* Tab switcher */}
          <div className={`ln-tab-bar ${accountType === "logistics" ? "ln-tab-bar--logistics" : ""}`}>
            {accountTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setAccountType(type.id)}
                aria-pressed={accountType === type.id}
                className={`ln-tab-btn ${accountType === type.id ? "ln-tab-btn--active" : ""}`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <h1
            id="login-heading"
            className="ln-heading"
            style={{ letterSpacing: "1px" }}
          >
            Masuk ke akun
          </h1>

          <form onSubmit={handleSubmit} noValidate className="ln-form">
            {/* Email */}
            <div className="ln-field-group">
              <label htmlFor="email" className="ln-label">Email</label>
              <div className="ln-input-wrap">
                <img src={vector} alt="" aria-hidden="true" className="ln-icon-left" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSubmitted(false); }}
                  placeholder="email@university.ac.id"
                  required
                  className="ln-input"
                />
              </div>
            </div>

            {/* Kata Sandi */}
            <div className="ln-field-group">
              <label htmlFor="password" className="ln-label">Kata Sandi</label>
              <div className="ln-input-wrap">
                <img src={image} alt="" aria-hidden="true" className="ln-icon-left ln-icon-lock" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setSubmitted(false); }}
                  placeholder="Masukkan Kata Sandi"
                  required
                  className="ln-input ln-input--password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  aria-pressed={showPassword}
                  className="ln-eye-btn"
                >
                  <img src={showPassword ? vector3 : vector2} alt="" aria-hidden="true" className="ln-eye-icon" />
                </button>
              </div>
            </div>

            {/* Lupa Kata Sandi */}
            <div className="ln-forgot-row">
              <button
                type="button"
                onClick={() => window.alert("Tautan pemulihan kata sandi akan dikirim ke email Anda.")}
                className="ln-forgot-btn"
              >
                Lupa Kata Sandi?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" className="ln-submit-btn">
              Masuk
            </button>

            {submitted && (
              <p className="sr-only" role="status">Form login telah dikirim.</p>
            )}
          </form>

          {/* Bantuan */}
          <p className="ln-help-text">
            Butuh Bantuan?{" "}
            <button
              type="button"
              onClick={() => window.alert("Silakan hubungi layanan bantuan NOOBO.")}
              className="ln-help-link"
            >
              Kontak Kami
            </button>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;