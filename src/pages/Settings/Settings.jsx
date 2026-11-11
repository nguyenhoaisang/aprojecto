import { useState } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/form.css';
import './Settings.css';

// Cài đặt mặc định nếu user chưa từng lưu
const DEFAULTS = { projectChanges: true, taskAssigned: true, emailAlerts: false, twoFactor: false };

const ALERT_OPTIONS = [
  { key: 'projectChanges', label: 'Cảnh báo khi dự án có thay đổi' },
  { key: 'taskAssigned', label: 'Cảnh báo khi được giao task mới' },
  { key: 'emailAlerts', label: 'Gửi cảnh báo qua email' },
];

// Cài đặt cảnh báo, bảo mật hai lớp và đổi mật khẩu
function Settings() {
  const { user, updateUser } = useAuth();

  const saved = user.settings || {};
  const [settings, setSettings] = useState({
    projectChanges: saved.projectChanges !== undefined ? saved.projectChanges : DEFAULTS.projectChanges,
    taskAssigned: saved.taskAssigned !== undefined ? saved.taskAssigned : DEFAULTS.taskAssigned,
    emailAlerts: saved.emailAlerts !== undefined ? saved.emailAlerts : DEFAULTS.emailAlerts,
    twoFactor: saved.twoFactor !== undefined ? saved.twoFactor : DEFAULTS.twoFactor,
  });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Bật/tắt một lựa chọn: tạo object mới giống cũ nhưng đổi đúng 1 khóa
  function toggle(key) {
    const next = { projectChanges: settings.projectChanges, taskAssigned: settings.taskAssigned, emailAlerts: settings.emailAlerts, twoFactor: settings.twoFactor };
    next[key] = !settings[key];
    setSettings(next);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    const changes = { settings: settings };
    // Chỉ đổi mật khẩu khi người dùng có nhập vào
    if (oldPassword !== '' || newPassword !== '' || confirm !== '') {
      if (oldPassword !== user.password) {
        setError('Mật khẩu hiện tại không đúng');
        return;
      }
      if (newPassword.length < 6) {
        setError('Mật khẩu mới cần ít nhất 6 ký tự');
        return;
      }
      if (newPassword !== confirm) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }
      changes.password = newPassword;
    }

    try {
      setSaving(true);
      const res = await api.patch('/users/' + user.id, changes);
      updateUser(res.data);
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
      setMessage('Đã lưu cài đặt.');
    } catch (err) {
      setError('Không lưu được cài đặt. Hãy thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="form-breadcrumb">Settings</h1>

      <form className="form-card set-card" onSubmit={handleSave}>
        <h2>Alerts</h2>
        {ALERT_OPTIONS.map(function (o) {
          return (
            <label key={o.key} className="set-row">
              <input type="checkbox" checked={settings[o.key]} onChange={function () { toggle(o.key); }} />
              {o.label}
            </label>
          );
        })}

        <h2>Security</h2>
        <label className="set-row">
          <input type="checkbox" checked={settings.twoFactor} onChange={function () { toggle('twoFactor'); }} />
          Bật bảo mật hai lớp (2FA)
        </label>

        <h2>Change password</h2>
        <div className="set-pass">
          <div className="form-field"><label>Mật khẩu hiện tại</label><input type="password" value={oldPassword} onChange={function (e) { setOldPassword(e.target.value); }} /></div>
          <div className="form-field"><label>Mật khẩu mới</label><input type="password" value={newPassword} onChange={function (e) { setNewPassword(e.target.value); }} /></div>
          <div className="form-field"><label>Xác nhận mật khẩu</label><input type="password" value={confirm} onChange={function (e) { setConfirm(e.target.value); }} /></div>
        </div>

        {error !== '' && <p className="form-error">{error}</p>}
        {message !== '' && <p className="set-ok">{message}</p>}
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button>
      </form>
    </div>
  );
}

export default Settings;
