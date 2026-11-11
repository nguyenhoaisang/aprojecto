import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiUser, FiActivity, FiPhone, FiMail, FiLayers } from 'react-icons/fi';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/form.css';
import './Profile.css';

const DESIGNATIONS = ['UI Intern', 'Developer', 'Tester', 'Designer', 'Team Lead'];
const NATIONALITIES = ['Vietnam', 'India', 'USA', 'Japan', 'Other'];
const TARGET_HOURS = 160; // mục tiêu giờ làm để vẽ vòng tròn tiến độ

// Hồ sơ cá nhân. /profile = của mình, /profile/:id = của người khác
function Profile() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const profileId = id ? Number(id) : user.id;
  const isOwn = profileId === user.id;

  const [person, setPerson] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [hours, setHours] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Các ô của form sửa hồ sơ
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('Vietnam');
  const [designation, setDesignation] = useState(DESIGNATIONS[0]);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  // Đổ dữ liệu của người đang xem vào các ô của form
  function fillForm(p) {
    const parts = p.name.split(' ');
    setFirstName(parts[0]);
    setLastName(parts.slice(1).join(' '));
    setEmail(p.email);
    setPhone(p.phone || '');
    setNationality(p.nationality || 'Vietnam');
    setDesignation(p.designation || DESIGNATIONS[0]);
    setNewPassword('');
  }

  useEffect(function () {
    setLoading(true);
    Promise.all([
      api.get('/users/' + profileId),
      api.get('/users'),
      api.get('/projects'),
      api.get('/timeLogs', { params: { userId: profileId } }),
    ])
      .then(function (results) {
        setPerson(results[0].data);
        setUsers(results[1].data);
        setProjects(results[2].data);
        let sum = 0;
        for (let i = 0; i < results[3].data.length; i++) {
          sum = sum + results[3].data[i].hours;
        }
        setHours(sum);
        fillForm(results[0].data);
        // Leader mở hồ sơ của mình thì vào thẳng form sửa (đúng Figma Admin_Profile)
        setEditing(isOwn && results[0].data.role === 'leader');
      })
      .catch(function () { setError('Không tải được hồ sơ này.'); })
      .finally(function () { setLoading(false); });
  }, [profileId, isOwn]);

  async function handleSave(e) {
    e.preventDefault();
    setMessage('');
    if (firstName.trim() === '') {
      setError('Vui lòng nhập tên');
      return;
    }
    if (!email.includes('@')) {
      setError('Email không hợp lệ');
      return;
    }
    if (newPassword !== '' && newPassword.length < 6) {
      setError('Mật khẩu mới cần ít nhất 6 ký tự');
      return;
    }
    const changes = {
      name: (firstName.trim() + ' ' + lastName.trim()).trim(),
      email: email.trim(),
      phone: phone.trim(),
      nationality: nationality,
      designation: designation,
    };
    if (newPassword !== '') {
      changes.password = newPassword;
    }
    try {
      setError('');
      const res = await api.patch('/users/' + profileId, changes);
      setPerson(res.data);
      if (isOwn) {
        updateUser(res.data);
      }
      setNewPassword('');
      setMessage('Đã lưu thay đổi.');
      if (res.data.role !== 'leader') {
        setEditing(false);
      }
    } catch (err) {
      setError('Không lưu được thay đổi. Hãy thử lại.');
    }
  }

  if (loading) {
    return <p>Đang tải...</p>;
  }
  if (person === null) {
    return <p className="pf-error">{error}</p>;
  }

  // Các dự án người này tham gia (hoặc làm leader)
  const myProjects = [];
  const coworkerIds = [];
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (p.memberIds.includes(person.id) || p.leaderId === person.id) {
      myProjects.push(p);
      const everyone = p.memberIds.concat([p.leaderId]);
      for (let j = 0; j < everyone.length; j++) {
        if (everyone[j] !== person.id && !coworkerIds.includes(everyone[j])) {
          coworkerIds.push(everyone[j]);
        }
      }
    }
  }
  const coworkers = [];
  for (let i = 0; i < users.length; i++) {
    if (coworkerIds.includes(users[i].id)) {
      coworkers.push(users[i]);
    }
  }

  // Tổng giờ làm đổi ra "tuần : ngày" (8 giờ = 1 ngày, 5 ngày = 1 tuần)
  const days = Math.floor(hours / 8);
  const weeks = Math.floor(days / 5);
  const restDays = days % 5;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(hours / TARGET_HOURS, 1);

  return (
    <div className="pf-layout">
      {/* Cột trái: thông tin tóm tắt */}
      <aside className="pf-card pf-side">
        <img className="pf-avatar" src={person.avatar} alt={person.name} />
        <strong>{person.name}</strong>
        <p>{person.location || '—'}</p>
        <ul>
          <li><FiUser size={18} /> {person.designation || (person.role === 'leader' ? 'Team Leader' : '—')}</li>
          <li><FiActivity size={18} /> Active</li>
          <li><FiPhone size={18} /> {person.phone || '—'}</li>
          <li><FiMail size={18} /> {person.email}</li>
          <li><FiLayers size={18} /> {person.department || '—'}</li>
        </ul>
      </aside>

      {/* Cột giữa: xem hoặc sửa hồ sơ */}
      <section className="pf-card pf-main">
        {editing ? (
          <form onSubmit={handleSave}>
            <h2>Edit Profile</h2>
            <div className="pf-form-grid">
              <div className="form-field"><label>First Name</label><input type="text" value={firstName} onChange={function (e) { setFirstName(e.target.value); }} /></div>
              <div className="form-field"><label>Last Name</label><input type="text" value={lastName} onChange={function (e) { setLastName(e.target.value); }} /></div>
              <div className="form-field"><label>Email</label><input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} /></div>
              <div className="form-field"><label>Phone Number</label><input type="text" value={phone} onChange={function (e) { setPhone(e.target.value); }} /></div>
              <div className="form-field"><label>Password</label><input type="password" placeholder="Change Password" value={newPassword} onChange={function (e) { setNewPassword(e.target.value); }} /></div>
              <div className="form-field">
                <label>Nationality</label>
                <select value={nationality} onChange={function (e) { setNationality(e.target.value); }}>
                  {NATIONALITIES.map(function (n) { return <option key={n} value={n}>{n}</option>; })}
                </select>
              </div>
              {person.role !== 'leader' && (
                <div className="form-field">
                  <label>Designation</label>
                  <select value={designation} onChange={function (e) { setDesignation(e.target.value); }}>
                    {DESIGNATIONS.map(function (d) { return <option key={d} value={d}>{d}</option>; })}
                  </select>
                </div>
              )}
            </div>
            {error !== '' && <p className="form-error">{error}</p>}
            {message !== '' && <p className="pf-ok">{message}</p>}
            <div className="form-actions pf-actions">
              <button type="submit" className="btn-primary">Save</button>
              {person.role !== 'leader' && (
                <button type="button" className="btn-light" onClick={function () { fillForm(person); setEditing(false); setError(''); }}>Cancel</button>
              )}
            </div>
          </form>
        ) : (
          <div>
            <small className="pf-crumb"><Link to="/dashboard">Início</Link> &gt; Profile</small>
            <h2>{person.designation || 'Team Leader'}</h2>
            <p className="pf-bio">{person.bio || 'Chưa có giới thiệu.'}</p>

            <div className="pf-section-head">
              <strong>Worked with</strong>
              {isOwn && <button className="pf-link" onClick={function () { setEditing(true); setMessage(''); }}>Edit profile</button>}
            </div>
            <div className="pf-people">
              {coworkers.map(function (u) {
                return (
                  <Link key={u.id} to={'/profile/' + u.id} className="pf-person">
                    <img src={u.avatar} alt={u.name} />
                    <span>{u.name}</span>
                  </Link>
                );
              })}
              {coworkers.length === 0 && <p className="pf-empty">Chưa làm việc chung với ai.</p>}
            </div>
            {message !== '' && <p className="pf-ok">{message}</p>}
          </div>
        )}
      </section>

      {/* Cột phải: dự án và tổng giờ làm */}
      <div className="pf-right">
        <section className="pf-card">
          <div className="pf-section-head">
            <strong>Projects</strong>
            <Link to="/projects" className="pf-link">View all</Link>
          </div>
          <div className="pf-tiles">
            {myProjects.slice(0, 6).map(function (p) {
              return (
                <Link key={p.id} to={'/projects/' + p.id} className="pf-tile">
                  <b className={'pf-t-' + p.status}>{p.title.charAt(0)}</b>
                  <span>{p.title}</span>
                </Link>
              );
            })}
            {myProjects.length === 0 && <p className="pf-empty">Chưa có dự án.</p>}
          </div>
        </section>

        <section className="pf-card">
          <div className="pf-section-head">
            <strong>Total work done</strong>
            <select className="pf-select"><option>This Week</option><option>This Month</option></select>
          </div>
          <div className="pf-donut">
            <svg viewBox="0 0 180 180" width="190" height="190">
              <circle cx="90" cy="90" r={radius} fill="none" stroke="#6b7280" strokeWidth="12" />
              <circle
                cx="90" cy="90" r={radius} fill="none" stroke="#0aa0f5" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
                transform="rotate(-90 90 90)"
              />
            </svg>
            <span>{weeks}w: {restDays}d</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;
