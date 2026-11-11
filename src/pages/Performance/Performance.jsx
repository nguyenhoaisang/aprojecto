import { useEffect, useState } from 'react';
import { FiSun, FiMessageSquare } from 'react-icons/fi';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import PerformanceChart from '../../components/Charts/PerformanceChart';
import WorkLogDonut from '../../components/Charts/WorkLogDonut';
import Pagination from '../../components/Pagination/Pagination';
import TaskModal from '../../components/TaskModal/TaskModal';
import { daysBetween, todayText } from '../../utils/dateUtils';
import './Performance.css';

const PAGE_SIZE = 5;

// Báo cáo hiệu suất: dùng chung cho Leader và Staff
function Performance() {
  const { user } = useAuth();
  const isLeader = user.role === 'leader';

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(function () {
    Promise.all([
      api.get('/tasks', { params: isLeader ? {} : { assigneeId: user.id } }),
      api.get('/users'),
      api.get('/performance'),
      api.get('/workLogs'),
    ])
      .then(function (results) {
        setTasks(results[0].data);
        setUsers(results[1].data);
        setPerformance(results[2].data);
        setWorkLogs(results[3].data);
      })
      .catch(function () { setError('Không tải được dữ liệu. Hãy chắc chắn đã chạy "npm run api".'); })
      .finally(function () { setLoading(false); });
  }, [isLeader, user.id]);

  function findUser(id) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        return users[i];
      }
    }
    return null;
  }

  function replaceTask(updated) {
    const list = [];
    for (let i = 0; i < tasks.length; i++) {
      list.push(tasks[i].id === updated.id ? updated : tasks[i]);
    }
    setTasks(list);
  }

  if (loading) {
    return <p>Đang tải...</p>;
  }
  if (error !== '') {
    return <p className="perf-error">{error}</p>;
  }

  let totalPages = Math.ceil(tasks.length / PAGE_SIZE);
  if (totalPages === 0) {
    totalPages = 1;
  }
  const pageItems = tasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedTask = tasks.find(function (t) { return t.id === selectedId; });

  return (
    <div>
      <h1 className="perf-title">Performance Report</h1>

      <div className="perf-grid">
        <section className="perf-card">
          <PerformanceChart data={performance} />
        </section>
        <section className="perf-card">
          <div className="perf-card-head">
            <h2>Work Log</h2>
            <select className="perf-select"><option>This Week</option><option>This Month</option></select>
          </div>
          <WorkLogDonut data={workLogs} />
        </section>
      </div>

      <div className="perf-list">
        {pageItems.map(function (t) {
          let opened = daysBetween(t.startDate, todayText());
          if (opened < 0) {
            opened = 0;
          }
          const owner = findUser(t.ownerId);
          const assignee = findUser(t.assigneeId);
          return (
            <div key={t.id} className="perf-row">
              <FiSun size={22} />
              <div className="perf-main">
                <strong>{t.title}</strong>
                <small>{t.code} Opened {opened} days ago by <b>{owner ? owner.name : '-'}</b></small>
              </div>
              <button className="perf-view" onClick={function () { setSelectedId(t.id); }}>View</button>
              {assignee && <img src={assignee.avatar} alt={assignee.name} title={assignee.name} />}
              <button className="perf-icon" onClick={function () { setSelectedId(t.id); }}><FiMessageSquare size={20} /></button>
            </div>
          );
        })}
        {tasks.length === 0 && <p className="perf-empty">Chưa có task nào để báo cáo.</p>}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {selectedTask && (
        <TaskModal task={selectedTask} users={users} onClose={function () { setSelectedId(null); }} onChange={replaceTask} />
      )}
    </div>
  );
}

export default Performance;
