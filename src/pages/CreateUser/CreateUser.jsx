import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { todayText } from '../../utils/dateUtils';
import '../../styles/form.css';
import './CreateUser.css';

const DESIGNATIONS = ['UI Intern', 'Developer', 'Tester', 'Designer', 'Team Lead'];
const DEPARTMENTS = ['PDT', 'QA', 'UI'];

// Leader thêm nhân viên mới (Admin_Add-Users)
function CreateUser() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createdDate, setCreatedDate] = useState(todayText());
  const [designation, setDesignation] = useState(DESIGNATIONS[0]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [photo, setPhoto] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Đọc file ảnh thành chuỗi base64 để lưu vào db.json (giới hạn 200KB cho nhẹ)
  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    if (file.size > 200 * 1024) {
      setError('Ảnh quá lớn, vui lòng chọn ảnh dưới 200KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      setPhoto(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (firstName.trim() === '' || lastName.trim() === '') {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    if (!email.includes('@')) {
      setError('Email không hợp lệ');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu tạm cần ít nhất 6 ký tự');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const check = await api.get('/users', { params: { email: email.trim() } });
      if (check.data.length > 0) {
        setError('Email này đã tồn tại');
        return;
      }
      await api.post('/users', {
        name: firstName.trim() + ' ' + lastName.trim(),
        email: email.trim(),
        password: password,
        role: 'staff',
        phone: phone.trim(),
        designation: designation,
        department: department,
        location: '',
        nationality: 'Vietnam',
        bio: '',
        createdDate: createdDate,
        createdBy: user.id,
        avatar: photo || 'https://i.pravatar.cc/80?u=' + email.trim(),
      });
      navigate('/overview');
    } catch (err) {
      setError('Không thêm được nhân viên. Hãy thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="form-breadcrumb"><Link to="/overview">Projects</Link> / Add User</h1>

      <form className="form-card cu-layout" onSubmit={handleSubmit}>
        <div>
          <div className="cu-grid">
            <div className="form-field"><label>First name</label><input type="text" value={firstName} onChange={function (e) { setFirstName(e.target.value); }} /></div>
            <div className="form-field"><label>Last Name</label><input type="text" value={lastName} onChange={function (e) { setLastName(e.target.value); }} /></div>
            <div className="form-field"><label>Phone No.</label><input type="text" value={phone} onChange={function (e) { setPhone(e.target.value); }} /></div>
            <div className="form-field"><label>Created Date</label><input type="date" value={createdDate} onChange={function (e) { setCreatedDate(e.target.value); }} /></div>
            <div className="form-field">
              <label>Designation</label>
              <select value={designation} onChange={function (e) { setDesignation(e.target.value); }}>
                {DESIGNATIONS.map(function (d) { return <option key={d} value={d}>{d}</option>; })}
              </select>
            </div>
            <div className="form-field">
              <label>Department</label>
              <select value={department} onChange={function (e) { setDepartment(e.target.value); }}>
                {DEPARTMENTS.map(function (d) { return <option key={d} value={d}>{d}</option>; })}
              </select>
            </div>
            <div className="form-field"><label>Email (dùng để đăng nhập)</label><input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} /></div>
            <div className="form-field"><label>Mật khẩu tạm</label><input type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} /></div>
            <div className="form-field">
              <label>Created By</label>
              <select value={user.id} disabled><option value={user.id}>{user.name}</option></select>
            </div>
          </div>

          {error !== '' && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
            <button type="button" className="btn-light" onClick={function () { navigate('/overview'); }} disabled={saving}>Cancel</button>
          </div>
        </div>

        <div className="cu-photo">
          <img src={photo || 'https://i.pravatar.cc/160?img=14'} alt="Ảnh đại diện" />
          <input type="file" accept="image/*" hidden ref={fileRef} onChange={handlePhoto} />
          <button type="button" onClick={function () { fileRef.current.click(); }}>Upload Photo</button>
        </div>
      </form>
    </div>
  );
}

export default CreateUser;
