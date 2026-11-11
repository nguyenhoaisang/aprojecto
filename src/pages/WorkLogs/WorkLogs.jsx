import { useEffect, useState } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination/Pagination';
import { formatSlash } from '../../utils/formatDate';
import { todayText } from '../../utils/dateUtils';
import '../../styles/form.css';
import './WorkLogs.css';

const PAGE_SIZE = 8;

// Nhật ký làm việc: Staff ghi giờ làm của mình, Leader xem của tất cả
function WorkLogs() {
  const { user } = useAuth();
  const isLeader = user.role === 'leader';

  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [taskId, setTaskId] = useState('');
  const [date, setDate] = useState(todayText());
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(function () {
    const params = isLeader ? {} : { userId: user.id };
    const taskParams = isLeader ? {} : { assigneeId: user.id };
    Promise.all([
      api.get('/timeLogs', { params: params }),
      api.get('/tasks', { params: taskParams }),
      api.get('/users'),
    ])
      .then(function (results) {
        setLogs(results[0].data);
        setTasks(results[1].data);
        setUsers(results[2].data);
      })
      .catch(function () { setError('Không tải được dữ liệu. Hãy chắc chắn đã chạy "npm run api".'); })
      .finally(function () { setLoading(false); });
  }, [isLeader, user.id]);

  function taskTitle(id) {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        return tasks[i].title;
      }
    }
    return '(task đã xóa)';
  }

  function userName(id) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        return users[i].name;
      }
    }
    return '-';
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (taskId === '') {
      setError('Vui lòng chọn task');
      return;
    }
    if (Number(hours) <= 0) {
      setError('Số giờ phải lớn hơn 0');
      return;
    }
    try {
      setError('');
      const res = await api.post('/timeLogs', {
        userId: user.id,
        taskId: Number(taskId),
        date: date,
        hours: Number(hours),
        note: note.trim(),
      });
      setLogs([res.data].concat(logs));
      setHours('');
      setNote('');
    } catch (err) {
      setError('Không lưu được nhật ký. Hãy thử lại.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Xóa dòng nhật ký này?')) {
      return;
    }
    try {
      await api.delete('/timeLogs/' + id);
      const rest = [];
      for (let i = 0; i < logs.length; i++) {
        if (logs[i].id !== id) {
          rest.push(logs[i]);
        }
      }
      setLogs(rest);
    } catch (err) {
      setError('Không xóa được dòng nhật ký.');
    }
  }

  if (loading) {
    return <p>Đang tải...</p>;
  }

  let totalHours = 0;
  for (let i = 0; i < logs.length; i++) {
    totalHours = totalHours + logs[i].hours;
  }
  let totalPages = Math.ceil(logs.length / PAGE_SIZE);
  if (totalPages === 0) {
    totalPages = 1;
  }
  const pageItems = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="wl-head">
        <h1>Work Logs</h1>
        <span className="wl-total">Tổng: {totalHours} giờ</span>
      </div>

      {!isLeader && (
        <form className="form-card wl-form" onSubmit={handleAdd}>
          <div className="form-field">
            <label>Task</label>
            <select value={taskId} onChange={function (e) { setTaskId(e.target.value); }}>
              <option value="">-- Chọn task --</option>
              {tasks.map(function (t) { return <option key={t.id} value={t.id}>{t.title}</option>; })}
            </select>
          </div>
          <div className="form-field"><label>Date</label><input type="date" value={date} onChange={function (e) { setDate(e.target.value); }} /></div>
          <div className="form-field"><label>Hours</label><input type="number" min="0" step="0.5" value={hours} onChange={function (e) { setHours(e.target.value); }} /></div>
          <div className="form-field"><label>Note</label><input type="text" value={note} onChange={function (e) { setNote(e.target.value); }} /></div>
          <button type="submit" className="btn-primary wl-btn">Add log</button>
        </form>
      )}

      {error !== '' && <p className="form-error">{error}</p>}

      <div className="wl-table-wrap">
        <table className="wl-table">
          <thead>
            <tr><th>Date</th><th>Task</th>{isLeader && <th>Member</th>}<th>Hours</th><th>Note</th><th></th></tr>
          </thead>
          <tbody>
            {pageItems.map(function (l) {
              return (
                <tr key={l.id}>
                  <td>{formatSlash(l.date)}</td>
                  <td>{taskTitle(l.taskId)}</td>
                  {isLeader && <td>{userName(l.userId)}</td>}
                  <td>{l.hours}</td>
                  <td>{l.note}</td>
                  <td>{l.userId === user.id && <button className="wl-del" onClick={function () { handleDelete(l.id); }}>Delete</button>}</td>
                </tr>
              );
            })}
            {logs.length === 0 && <tr><td colSpan="6" className="wl-empty">Chưa có nhật ký nào.</td></tr>}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

export default WorkLogs;
