import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPaperclip, FiMessageCircle, FiPlus, FiClock } from 'react-icons/fi';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import TaskRow from '../../components/TaskRow/TaskRow';
import TaskModal from '../../components/TaskModal/TaskModal';
import Pagination from '../../components/Pagination/Pagination';
import { addDays, daysBetween, todayText } from '../../utils/dateUtils';
import './Tasks.css';

const PAGE_SIZE = 8;

// 3 cột Kanban. match = các trạng thái được xếp vào cột; status = trạng thái gán khi thả task vào cột
const COLUMNS = [
  { title: 'Backlog', status: 'Pending', match: ['Pending', 'On Hold'] },
  { title: 'In progress', status: 'On Progress', match: ['On Progress'] },
  { title: 'Completed', status: 'Completed', match: ['Completed'] },
];

function Tasks() {
  const { user } = useAuth();
  const isLeader = user.role === 'leader';
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [view, setView] = useState('list'); // 'list' hoặc 'kanban'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Staff chỉ thấy task được giao cho mình, Leader thấy tất cả
  useEffect(function () {
    Promise.all([
      api.get('/tasks', { params: isLeader ? {} : { assigneeId: user.id } }),
      api.get('/users'),
      api.get('/projects'),
      api.get('/subtasks'),
    ])
      .then(function (results) {
        setTasks(results[0].data);
        setUsers(results[1].data);
        setProjects(results[2].data);
        setSubtasks(results[3].data);
      })
      .catch(function () { setError('Không tải được dữ liệu. Hãy chắc chắn đã chạy "npm run api".'); })
      .finally(function () { setLoading(false); });
  }, [user.id, isLeader]);

  function findUser(id) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        return users[i];
      }
    }
    return null;
  }

  function countSubtasks(taskId) {
    let count = 0;
    for (let i = 0; i < subtasks.length; i++) {
      if (subtasks[i].taskId === taskId) {
        count++;
      }
    }
    return count;
  }

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

  // Thả task vào một cột: đổi trạng thái nếu khác cột hiện tại
  async function handleDrop(column) {
    const task = tasks.find(function (t) { return t.id === dragId; });
    setDragId(null);
    if (!task || column.match.includes(task.status)) {
      return;
    }
    try {
      const res = await api.patch('/tasks/' + task.id, { status: column.status });
      replaceTask(res.data);
    } catch (err) {
      setError('Không chuyển được task. Hãy thử lại.');
    }
  }

  // Bấm dấu + ở đầu cột để thêm task mới vào cột đó
  async function handleAdd(column) {
    const title = window.prompt('Tên task mới:');
    if (!title || title.trim() === '') {
      return;
    }
    // Gắn vào dự án đầu tiên mà user tham gia (Leader: dự án đầu tiên)
    let projectId = null;
    for (let i = 0; i < projects.length; i++) {
      if (projectId === null && (isLeader || projects[i].memberIds.includes(user.id))) {
        projectId = projects[i].id;
      }
    }
    if (projectId === null) {
      setError('Bạn chưa tham gia dự án nào nên chưa thể thêm task.');
      return;
    }
    try {
      const res = await api.post('/tasks', {
        projectId: projectId,
        title: title.trim(),
        code: '#' + (Date.now() % 1000000),
        status: column.status,
        priority: 'low',
        assigneeId: user.id,
        ownerId: user.id,
        time: '00:00:00',
        startDate: todayText(),
        endDate: addDays(todayText(), 7),
        description: '',
        attachments: [],
        comments: [],
      });
      setTasks(tasks.concat([res.data]));
    } catch (err) {
      setError('Không thêm được task. Hãy thử lại.');
    }
  }

  if (loading) {
    return <p>Đang tải...</p>;
  }

  // Lọc task theo ô tìm kiếm
  const filtered = [];
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].title.toLowerCase().includes(search.toLowerCase())) {
      filtered.push(tasks[i]);
    }
  }
  let totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (totalPages === 0) {
    totalPages = 1;
  }
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedTask = tasks.find(function (t) { return t.id === selectedId; });

  return (
    <div>
      <div className="tasks-head">
        <h1>Tasks</h1>
        <div className="tasks-tools">
          <div className="tasks-search">
            <FiSearch size={18} />
            <input
              type="text"
              placeholder="Search tasks"
              value={search}
              onChange={function (e) { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="tasks-view" value={view} onChange={function (e) { setView(e.target.value); }}>
            <option value="list">List View</option>
            <option value="kanban">Kanban View</option>
          </select>
        </div>
      </div>

      {error !== '' && <p className="tasks-error">{error}</p>}

      {view === 'list' && (
        <div>
          {filtered.length === 0 && <p className="tasks-empty">Không có task nào.</p>}
          {pageItems.map(function (t) {
            return (
              <TaskRow
                key={t.id}
                task={t}
                assignee={findUser(t.assigneeId)}
                ownerName={findUser(t.ownerId) ? findUser(t.ownerId).name : '-'}
                subtaskCount={countSubtasks(t.id)}
                onOpen={function () { setSelectedId(t.id); }}
                menuActions={isLeader ? [
                  { label: 'Sub tasks', onClick: function () { navigate('/tasks/' + t.id); } },
                  { label: 'View details', onClick: function () { setSelectedId(t.id); } },
                ] : undefined}
              />
            );
          })}
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      {view === 'kanban' && (
        <div className="kanban-wrap">
          <h2>Overview</h2>
          <p className="kanban-sub">Kéo thả task giữa các cột để đổi trạng thái</p>
          <div className="kanban-board">
            {COLUMNS.map(function (col) {
              const colTasks = [];
              for (let i = 0; i < filtered.length; i++) {
                if (col.match.includes(filtered[i].status)) {
                  colTasks.push(filtered[i]);
                }
              }
              return (
                <div
                  key={col.title}
                  className="kcol"
                  onDragOver={function (e) { e.preventDefault(); }}
                  onDrop={function () { handleDrop(col); }}
                >
                  <div className="kcol-head">{col.title} <span>{colTasks.length}</span></div>
                  <button className="kcol-add" onClick={function () { handleAdd(col); }} title="Thêm task"><FiPlus size={20} /></button>

                  {colTasks.map(function (t) {
                    let daysLeft = daysBetween(todayText(), t.endDate);
                    if (daysLeft < 0) {
                      daysLeft = 0;
                    }
                    const owner = findUser(t.ownerId);
                    const assignee = findUser(t.assigneeId);
                    return (
                      <div
                        key={t.id}
                        className={dragId === t.id ? 'kcard dragging' : 'kcard'}
                        draggable
                        onDragStart={function () { setDragId(t.id); }}
                        onDragEnd={function () { setDragId(null); }}
                        onClick={function () { setSelectedId(t.id); }}
                      >
                        <div className="kcard-top">
                          <strong>{t.title}</strong>
                          <span><FiClock size={15} /> {daysLeft} Days</span>
                        </div>
                        <p>{t.description}</p>
                        <div className="kcard-foot">
                          <span><FiPaperclip size={15} /> {(t.attachments || []).length}</span>
                          <span><FiMessageCircle size={15} /> {(t.comments || []).length}</span>
                          <div className="kcard-avatars">
                            {owner && <img src={owner.avatar} alt={owner.name} />}
                            {assignee && <img src={assignee.avatar} alt={assignee.name} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskModal task={selectedTask} users={users} onClose={function () { setSelectedId(null); }} onChange={replaceTask} />
      )}
    </div>
  );
}

export default Tasks;
