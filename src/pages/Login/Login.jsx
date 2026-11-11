import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Đã đăng nhập rồi thì không cần vào trang login nữa
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Kiểm tra dữ liệu nhập
    if (email.trim() === '' || password === '') {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    if (!agree) {
      setError('Bạn cần đồng ý Terms & Conditions');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message === 'Network Error') {
        setError('Không kết nối được server. Hãy chạy "npm run api" trước.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-top">
        <span className="login-logo">AProjectO</span>
        <span className="login-system">Asite Product System</span>
      </div>

      <div className="login-main">
        {/* Hình minh họa bên trái: vẽ bằng SVG đơn giản */}
        <svg className="login-art" viewBox="0 0 400 420">
          <circle cx="200" cy="260" r="170" fill="#1b2a8f" />
          <rect x="130" y="40" width="190" height="320" rx="14" fill="#4aa0e0" />
          <text x="225" y="95" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="700">LOGIN ACCESS</text>
          <path d="M225 120 L275 140 L275 190 Q225 240 175 190 L175 140 Z" fill="#2f6fc2" />
          <rect x="205" y="160" width="40" height="30" rx="4" fill="#cfe4f7" />
          <rect x="150" y="260" width="150" height="26" fill="#3b86d6" />
          <rect x="150" y="296" width="150" height="26" fill="#3b86d6" />
          <circle cx="70" cy="140" r="26" fill="#f2c9a0" />
          <rect x="45" y="168" width="52" height="110" rx="20" fill="#e8467c" />
          <rect x="50" y="278" width="42" height="100" fill="#7a1b4a" />
        </svg>

        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <p className="login-sub">Welcome back! Please enter your details.</p>

          <label>Email</label>
          <input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} />

          <label>Password</label>
          <div className="password-box">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={function (e) { setPassword(e.target.value); }}
            />
            <button type="button" className="eye" onClick={function () { setShowPassword(!showPassword); }}>
              {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </button>
          </div>

          <div className="login-row">
            <label className="terms">
              <input type="checkbox" checked={agree} onChange={function (e) { setAgree(e.target.checked); }} />
              Terms &amp; Conditions
            </label>
            <a href="#quen-mat-khau">Forgot Password</a>
          </div>

          {error !== '' && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Log in'}
          </button>

          <p className="login-signup">
            Don&apos;t have an account? <Link to="/register">Sign up for free</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
