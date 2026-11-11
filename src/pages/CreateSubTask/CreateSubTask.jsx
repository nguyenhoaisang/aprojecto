import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import PeoplePicker from '../../components/PeoplePicker/PeoplePicker';
import { toggleId } from '../../utils/toggleId';
import '../../styles/form.css';
import './CreateSubTask.css';

const STATUS_LIST = ['Pending', 'On Progress', 'On Hold', 'Completed'];

function CreateSubTask() {
  const { taskId } = useParams(); // subtask thuộc về task nào
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Pending');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [reporterId, setReporterId] = useState(null); // chỉ chọn 1 người báo cáo
  const [assigneeIds, setAssigneeIds] = useState([]); // có thể giao cho nhiều người
  const [attachments, setAttachments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(function () {
    api.get('/users', { params: { role: 'staff' } })
      .then(function (res) { setStaffList(res.data); })
      .catch(function () { setError('Không tải được danh sách nhân viên'); });
  }, []);

  // Lưu tên các file đã chọn (json-server không lưu được file thật)
  function handleFiles(e) {
    const names = [];
    for (let i = 0; i < e.target.files.length; i++) {
      names.push(e.target.files[i].name);
    }
    setAttachments(names);
  }

  async function handleCreate(e) {
    e.preventDefault();

    if (title.trim() === '') {
      setError('Vui lòng nhập tên SubTask');
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
    if (reporterId === null) {
      setError('Vui lòng chọn người báo cáo (Reporter)');
      return;
    }
    if (assigneeIds.length === 0) {
      setError('Vui lòng chọn ít nhất một người thực hiện (Assignee)');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await api.post('/subtasks', {
        taskId: Number(taskId),
        title: title.trim(),
        status: status,
        startDate: startDate,
        endDate: endDate,
        description: description.trim(),
        reporterId: reporterId,
        assigneeIds: assigneeIds,
        attachments: attachments,
      });
      navigate('/tasks');
    } catch (err) {
      setError('Không tạo được SubTask. Hãy thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="form-breadcrumb">
        <Link to="/tasks">SubTask</Link> / Create SubTask
      </h1>

      <form className="form-card" onSubmit={handleCreate}>
        <div className="form-grid">
          <div className="form-field">
            <label>SubTask Title</label>
            <input type="text" value={title} onChange={function (e) { setTitle(e.target.value); }} />
          </div>
          <div className="form-field">
            <label>SubTask Status</label>
            <select value={status} onChange={function (e) { setStatus(e.target.value); }}>
              {STATUS_LIST.map(function (s) {
                return <option key={s} value={s}>{s}</option>;
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
          <label>SubTask Description</label>
          <textarea value={description} onChange={function (e) { setDescription(e.target.value); }} />
        </div>

        <div className="subtask-bottom">
          <div>
            <p className="form-label">Reporter</p>
            <PeoplePicker
              users={staffList}
              selectedIds={reporterId === null ? [] : [reporterId]}
              onToggle={function (id) { setReporterId(reporterId === id ? null : id); }}
            />
          </div>
          <div>
            <p className="form-label">Assignee</p>
            <PeoplePicker
              users={staffList}
              selectedIds={assigneeIds}
              onToggle={function (id) { setAssigneeIds(toggleId(assigneeIds, id)); }}
            />
          </div>

          <div className="subtask-side">
            <input type="file" multiple hidden ref={fileRef} onChange={handleFiles} />
            <button type="button" className="btn-green" onClick={function () { fileRef.current.click(); }}>
              Add Attachment
            </button>
            {attachments.length > 0 && (
              <ul className="subtask-files">
                {attachments.map(function (name) {
                  return <li key={name}>{name}</li>;
                })}
              </ul>
            )}
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Create'}
              </button>
              <button type="button" className="btn-light" onClick={function () { navigate('/tasks'); }} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        {error !== '' && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}

export default CreateSubTask;
