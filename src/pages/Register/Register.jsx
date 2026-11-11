import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    // Kiểm tra từng điều kiện (if/else đơn giản)
    if (name.trim() === '' || email.trim() === '' || password === '') {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu cần ít nhất 6 ký tự');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(name.trim(), email.trim(), password);
      alert('Đăng ký thành công! Hãy đăng nhập.');
      navigate('/login');
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
    <div className="login-page register-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p className="login-sub">Đăng ký tài khoản Staff để sử dụng AProjectO.</p>

        <label>Name</label>
        <input type="text" value={name} onChange={function (e) { setName(e.target.value); }} />

        <label>Email</label>
        <input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} />

        <label>Password</label>
        <input type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} />

        <label>Confirm password</label>
        <input type="password" value={confirm} onChange={function (e) { setConfirm(e.target.value); }} />

        {error !== '' && <p className="login-error register-error">{error}</p>}

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Sign up'}
        </button>

        <p className="login-signup">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
