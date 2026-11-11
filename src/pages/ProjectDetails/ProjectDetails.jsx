import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiClock, FiMessageCircle, FiFile } from 'react-icons/fi';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import TaskRow from '../../components/TaskRow/TaskRow';
import TaskModal from '../../components/TaskModal/TaskModal';
import { formatSpan, todayText } from '../../utils/dateUtils';
import { toggleId } from '../../utils/toggleId';
import './ProjectDetails.css';

function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const isLeader = user.role === 'leader';
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checklistMode, setChecklistMode] = useState(false);
  const [checkedIds, setCheckedIds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(function () {
    Promise.all([
      api.get('/projects/' + id),
      api.get('/tasks', { params: { projectId: id } }),
      api.get('/users'),
    ])
      .then(function (results) {
        setProject(results[0].data);
        setTasks(results[1].data);
        setUsers(results[2].data);
      })
      .catch(function () { setError('Không tải được dự án này.'); })
      .finally(function () { setLoading(false); });
  }, [id]);

  function findUser(userId) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === userId) {
        return users[i];
      }
    }
    return null;
  }

  // Thay task cũ trong danh sách bằng task mới vừa cập nhật
  function replaceTask(updated) {
    const list = [];
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === updated.id) {
        list.push(updated);
      } else {
        list.push(tasks[i]);
      }
    }
    setTasks(list);
  }

  async function markCompleted(taskIds) {
    try {
      for (let i = 0; i < taskIds.length; i++) {
        const res = await api.patch('/tasks/' + taskIds[i], { status: 'Completed' });
        replaceTask(res.data);
      }
      setCheckedIds([]);
    } catch (err) {
      setError('Không cập nhật được task. Hãy thử lại.');
    }
  }

  // Menu 3 chấm của mỗi dòng task: Leader có thêm mục xem subtask
  function rowMenu(t) {
    const actions = [
      { label: 'View details', onClick: function () { setSelectedId(t.id); } },
      { label: 'Mark as completed', onClick: function () { markCompleted([t.id]); } },
    ];
    if (isLeader) {
      actions.unshift({ label: 'Sub tasks', onClick: function () { navigate('/tasks/' + t.id); } });
    }
    return actions;
  }

  if (loading) {
    return <p>Đang tải...</p>;
  }
  if (project === null) {
    return <p className="pd-error">{error} <Link to="/projects">Quay lại danh sách</Link></p>;
  }

  const leader = findUser(project.leaderId);
  const members = [];
  for (let i = 0; i < project.memberIds.length; i++) {
    const m = findUser(project.memberIds[i]);
    if (m) {
      members.push(m);
    }
  }
  const shown = members.slice(0, 4);
  const extra = members.length - shown.length;
  const selectedTask = tasks.find(function (t) { return t.id === selectedId; });

  return (
    <div>
      <p className="pd-breadcrumb"><Link to="/projects">Projects</Link> / {project.title}</p>

      <div className="pd-head">
        <div className="pd-title">
          <h1>{project.title}</h1>
          {leader && <img src={leader.avatar} alt={leader.name} title={leader.name} />}
          <span className="pd-arrow">→</span>
          <div className="pd-avatars">
            {shown.map(function (u) { return <img key={u.id} src={u.avatar} alt={u.name} title={u.name} />; })}
            {extra > 0 && <span className="pd-more">+{extra}</span>}
          </div>
          <span className="pd-status">{project.status}</span>
        </div>
        <div className="pd-times">
          <div><small>Time spent</small><span className="pd-pill"><FiClock size={18} /> {formatSpan(project.startDate, todayText())}</span></div>
          <div><small>Deadline</small><span className="pd-pill"><FiClock size={18} /> {formatSpan(todayText(), project.endDate)}</span></div>
        </div>
      </div>

      <div className="pd-panel">
        <div className="pd-toolbar">
          <button
            className={checklistMode ? 'pd-btn on' : 'pd-btn'}
            onClick={function () { setChecklistMode(!checklistMode); setCheckedIds([]); }}
          >
            Checklist
          </button>
          {isLeader && (
            <Link to={'/projects/' + id + '/tasks/create'} className="pd-btn primary">Assign Task</Link>
          )}
          {checklistMode && (
            <button className="pd-btn primary" disabled={checkedIds.length === 0} onClick={function () { markCompleted(checkedIds); }}>
              Mark selected as Completed
            </button>
          )}
        </div>

        {error !== '' && <p className="pd-error">{error}</p>}
        {tasks.length === 0 && <p className="pd-empty">Dự án này chưa có task nào.</p>}

        {tasks.map(function (t) {
          return (
            <TaskRow
              key={t.id}
              task={t}
              assignee={findUser(t.assigneeId)}
              ownerName={findUser(t.ownerId) ? findUser(t.ownerId).name : '-'}
              showDates={true}
              checklist={checklistMode ? { checked: checkedIds.includes(t.id), onChange: function () { setCheckedIds(toggleId(checkedIds, t.id)); } } : null}
              onOpen={function () { setSelectedId(t.id); }}
              menuActions={rowMenu(t)}
            />
          );
        })}

        <div className="pd-foot">
          <span><FiMessageCircle size={16} /> {tasks.length} tasks</span>
          <span><FiFile size={16} /> {project.files} files</span>
        </div>
      </div>

      {selectedTask && (
        <TaskModal task={selectedTask} users={users} onClose={function () { setSelectedId(null); }} onChange={replaceTask} />
      )}
    </div>
  );
}

export default ProjectDetails;
