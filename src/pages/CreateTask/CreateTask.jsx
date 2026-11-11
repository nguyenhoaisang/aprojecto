import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import PeoplePicker from '../../components/PeoplePicker/PeoplePicker';
import '../../styles/form.css';
import './CreateTask.css';

const STATUS_LIST = ['Pending', 'On Progress', 'On Hold', 'Completed'];

// Leader giao task mới cho thành viên trong dự án
function CreateTask() {
  const { id } = useParams(); // id dự án
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('low');
  const [status, setStatus] = useState('Pending');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Lấy dự án và danh sách thành viên của dự án đó
  useEffect(function () {
    async function load() {
      try {
        const p = await api.get('/projects/' + id);
        const all = await api.get('/users');
        const list = [];
        for (let i = 0; i < all.data.length; i++) {
          if (p.data.memberIds.includes(all.data[i].id)) {
            list.push(all.data[i]);
          }
        }
        setProject(p.data);
        setMembers(list);
      } catch (err) {
        setError('Không tải được dự án này.');
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (title.trim() === '') {
      setError('Vui lòng nhập tên task');
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
    if (assigneeId === null) {
      setError('Vui lòng chọn người thực hiện');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await api.post('/tasks', {
        projectId: Number(id),
        title: title.trim(),
        code: '#' + (Date.now() % 1000000),
        status: status,
        priority: priority,
        assigneeId: assigneeId,
        ownerId: user.id,
        time: '00:00:00',
        startDate: startDate,
        endDate: endDate,
        description: description.trim(),
        attachments: [],
        comments: [],
      });
      navigate('/projects/' + id);
    } catch (err) {
      setError('Không tạo được task. Hãy thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="form-breadcrumb">
        <Link to={'/projects/' + id}>{project ? project.title : 'Project'}</Link> / Assign Task
      </h1>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field"><label>Task Title</label><input type="text" value={title} onChange={function (e) { setTitle(e.target.value); }} /></div>
          <div className="form-field">
            <label>Task Status</label>
            <select value={status} onChange={function (e) { setStatus(e.target.value); }}>
              {STATUS_LIST.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
            </select>
          </div>
          <div className="form-field"><label>Start Date</label><input type="date" value={startDate} onChange={function (e) { setStartDate(e.target.value); }} /></div>
          <div className="form-field"><label>End Date</label><input type="date" value={endDate} onChange={function (e) { setEndDate(e.target.value); }} /></div>
        </div>

        <div className="form-field ct-priority">
          <label>Priority</label>
          <select value={priority} onChange={function (e) { setPriority(e.target.value); }}>
            <option value="low">low</option>
            <option value="high">high</option>
          </select>
        </div>

        <div className="form-field">
          <label>Task Description</label>
          <textarea value={description} onChange={function (e) { setDescription(e.target.value); }} />
        </div>

        <p className="form-label">Assignee (thành viên của dự án)</p>
        <div className="form-bottom">
          <PeoplePicker
            users={members}
            selectedIds={assigneeId === null ? [] : [assigneeId]}
            onToggle={function (uid) { setAssigneeId(assigneeId === uid ? null : uid); }}
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
            <button type="button" className="btn-light" onClick={function () { navigate('/projects/' + id); }} disabled={saving}>Cancel</button>
          </div>
        </div>

        {error !== '' && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}

export default CreateTask;
