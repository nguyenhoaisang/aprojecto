import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/api';
import TaskRow from '../../components/TaskRow/TaskRow';
import './SubTasks.css';

// Đổi 1 subtask thành dữ liệu có đủ trường để dùng chung component TaskRow
function toRowTask(s) {
  return { id: s.id, title: s.title, code: '#S' + s.id, status: s.status, priority: 'low', startDate: s.startDate, endDate: s.endDate, time: '00:30:00' };
}

// Leader xem 1 task cùng các subtask của nó (Admin_subTask)
function SubTasks() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(function () {
    Promise.all([
      api.get('/tasks/' + taskId),
      api.get('/subtasks', { params: { taskId: taskId } }),
      api.get('/users'),
    ])
      .then(function (results) {
        setTask(results[0].data);
        setSubtasks(results[1].data);
        setUsers(results[2].data);
      })
      .catch(function () { setError('Không tải được task này.'); })
      .finally(function () { setLoading(false); });
  }, [taskId]);

  function findUser(id) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        return users[i];
      }
    }
    return null;
  }

  async function handleDelete(id) {
    if (!window.confirm('Xóa subtask này?')) {
      return;
    }
    try {
      await api.delete('/subtasks/' + id);
      const rest = [];
      for (let i = 0; i < subtasks.length; i++) {
        if (subtasks[i].id !== id) {
          rest.push(subtasks[i]);
        }
      }
      setSubtasks(rest);
    } catch (err) {
      setError('Không xóa được subtask.');
    }
  }

  if (loading) {
    return <p>Đang tải...</p>;
  }
  if (task === null) {
    return <p className="st-error">{error} <Link to="/tasks">Quay lại</Link></p>;
  }

  const owner = findUser(task.ownerId);

  return (
    <div>
      <div className="st-head">
        <h1><Link to="/tasks">Task</Link> / {task.title}</h1>
        <Link to={'/tasks/' + taskId + '/subtasks/create'} className="st-assign">Assign Sub task</Link>
      </div>

      {error !== '' && <p className="st-error">{error}</p>}

      <div className="st-panel">
        <TaskRow task={task} assignee={findUser(task.assigneeId)} ownerName={owner ? owner.name : '-'} onOpen={function () {}} />

        <div className="st-indent">
          {subtasks.length === 0 && <p className="st-empty">Task này chưa có subtask nào.</p>}
          {subtasks.map(function (s) {
            const reporter = findUser(s.reporterId);
            return (
              <TaskRow
                key={s.id}
                task={toRowTask(s)}
                assignee={findUser(s.assigneeIds[0])}
                ownerName={reporter ? reporter.name : '-'}
                onOpen={function () {}}
                menuActions={[{ label: 'Delete subtask', onClick: function () { handleDelete(s.id); } }]}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SubTasks;
