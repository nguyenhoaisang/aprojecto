import { useState } from 'react';
import './PeoplePicker.css';

// Hộp chọn người: có dropdown lọc theo chức danh và danh sách checkbox
// Props: users (danh sách người), selectedIds (id đã chọn), onToggle (hàm gọi khi bấm chọn)
function PeoplePicker({ users, selectedIds, onToggle }) {
  const [filter, setFilter] = useState('All');

  // Gom các chức danh khác nhau để làm danh sách lọc
  const roles = ['All'];
  for (let i = 0; i < users.length; i++) {
    if (users[i].designation && !roles.includes(users[i].designation)) {
      roles.push(users[i].designation);
    }
  }

  // Chỉ giữ người đúng chức danh đang lọc
  const shown = [];
  for (let i = 0; i < users.length; i++) {
    if (filter === 'All' || users[i].designation === filter) {
      shown.push(users[i]);
    }
  }

  return (
    <div className="picker">
      <select className="picker-filter" value={filter} onChange={function (e) { setFilter(e.target.value); }}>
        {roles.map(function (r) {
          return <option key={r} value={r}>{r}</option>;
        })}
      </select>
      <ul className="picker-list">
        {shown.map(function (u) {
          return (
            <li key={u.id}>
              <label>
                <span className="picker-name">{u.name}</span>
                <span className="picker-role">{u.designation}</span>
                <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={function () { onToggle(u.id); }} />
              </label>
            </li>
          );
        })}
        {shown.length === 0 && <li className="picker-empty">Chưa có nhân viên nào</li>}
      </ul>
    </div>
  );
}

export default PeoplePicker;
