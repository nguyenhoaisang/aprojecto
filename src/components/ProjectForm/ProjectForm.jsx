import { useEffect, useState } from 'react';
import api from '../../api/api';
import PeoplePicker from '../PeoplePicker/PeoplePicker';
import { toggleId } from '../../utils/toggleId';
import '../../styles/form.css';

const TYPES = ['Type - I', 'Type - II', 'Type - III'];
const EMPTY = { title: '', type: 'Type - I', description: '', startDate: '', endDate: '', memberIds: [] };

// Form dùng chung cho cả trang Tạo dự án và Sửa dự án
// initialData: dữ liệu có sẵn (khi sửa). Không truyền thì là form trống.
function ProjectForm({ initialData, submitLabel, secondaryLabel, onSubmit, onSecondary, saving, serverError }) {
  const first = initialData || EMPTY;

  const [title, setTitle] = useState(first.title);
  const [type, setType] = useState(first.type);
  const [description, setDescription] = useState(first.description);
  const [startDate, setStartDate] = useState(first.startDate);
  const [endDate, setEndDate] = useState(first.endDate);
  const [memberIds, setMemberIds] = useState(first.memberIds);
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState('');

  // Lấy danh sách nhân viên để chọn vào dự án
  useEffect(function () {
    api.get('/users', { params: { role: 'staff' } })
      .then(function (res) { setStaffList(res.data); })
      .catch(function () { setError('Không tải được danh sách nhân viên'); });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    if (title.trim() === '') {
      setError('Vui lòng nhập tên dự án');
      return;
    }
    if (startDate === '' || endDate === '') {
      setError('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
      return;
    }
    if (endDate < startDate) {
      setError('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }
    setError('');
    onSubmit({
      title: title.trim(),
      type: type,
      description: description.trim(),
      startDate: startDate,
      endDate: endDate,
      memberIds: memberIds,
    });
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-field">
          <label>Project Title</label>
          <input type="text" value={title} onChange={function (e) { setTitle(e.target.value); }} />
        </div>
        <div className="form-field">
          <label>Project Type</label>
          <select value={type} onChange={function (e) { setType(e.target.value); }}>
            {TYPES.map(function (t) {
              return <option key={t} value={t}>{t}</option>;
            })}
          </select>
        </div>
        <div className="form-field">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={function (e) { setStartDate(e.target.value); }} />
        </div>
        <div className="form-field">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={function (e) { setEndDate(e.target.value); }} />
        </div>
      </div>

      <div className="form-field">
        <label>Project Description</label>
        <textarea value={description} onChange={function (e) { setDescription(e.target.value); }} />
      </div>

      <p className="form-label">Project Roles</p>
      <div className="form-bottom">
        <PeoplePicker
          users={staffList}
          selectedIds={memberIds}
          onToggle={function (id) { setMemberIds(toggleId(memberIds, id)); }}
        />
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : submitLabel}
          </button>
          <button type="button" className="btn-light" onClick={onSecondary} disabled={saving}>
            {secondaryLabel}
          </button>
        </div>
      </div>

      {(error !== '' || serverError) && <p className="form-error">{error || serverError}</p>}
    </form>
  );
}

export default ProjectForm;
