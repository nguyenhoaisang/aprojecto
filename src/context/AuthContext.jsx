import { createContext, useContext, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

// Lấy user đã lưu trong localStorage (để F5 không bị đăng xuất)
function getSavedUser() {
  const saved = localStorage.getItem('user');
  if (saved) {
    return JSON.parse(saved);
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser());

  // Đăng nhập: tìm user có đúng email + password
  async function login(email, password) {
    const res = await api.get('/users', { params: { email: email, password: password } });
    if (res.data.length === 0) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }
    const found = res.data[0];
    setUser(found);
    localStorage.setItem('user', JSON.stringify(found));
    return found;
  }

  // Đăng ký: tài khoản mới luôn là Staff
  async function register(name, email, password) {
    const check = await api.get('/users', { params: { email: email } });
    if (check.data.length > 0) {
      throw new Error('Email này đã được đăng ký');
    }
    const newUser = { name: name, email: email, password: password, role: 'staff', location: '', avatar: '' };
    await api.post('/users', newUser);
  }

  // Cập nhật thông tin user đang đăng nhập (sau khi sửa profile / settings)
  function updateUser(newUser) {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook để các trang gọi cho gọn: const { user } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
