import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FiFolder } from 'react-icons/fi';
import api from '../../api/api';
import './Dashboard.css';

// Màu và tên các trạng thái task (đúng theo Figma)
const STATUS_LIST = [
  { name: 'Completed', color: '#23879a' },
  { name: 'On Hold', color: '#6359d6' },
  { name: 'On Progress', color: '#38b6f2' },
  { name: 'Pending', color: '#d92d20' },
];
const LOG_COLORS = ['#fa4343', '#2a9ddb', '#f7931e', '#f9c74f', '#90be6d'];

// Hiện số % bên trong mỗi miếng của biểu đồ tròn
function renderPercent(props) {
  const radian = Math.PI / 180;
  const r = props.innerRadius + (props.outerRadius - props.innerRadius) * 0.55;
  const x = props.cx + r * Math.cos(-props.midAngle * radian);
  const y = props.cy + r * Math.sin(-props.midAngle * radian);
  if (props.percent === 0) {
    return null;
  }
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={18}>
      {Math.round(props.percent * 100) + '%'}
    </text>
  );
}

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Gọi API 1 lần khi trang mở
  useEffect(function () {
    async function loadData() {
      try {
        const results = await Promise.all([
          api.get('/projects'),
          api.get('/tasks'),
          api.get('/workLogs'),
          api.get('/performance'),
        ]);
        setProjects(results[0].data);
        setTasks(results[1].data);
        setWorkLogs(results[2].data);
        setPerformance(results[3].data);
      } catch (err) {
        setError('Không tải được dữ liệu. Hãy chắc chắn đã chạy "npm run api".');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <p>Đang tải...</p>;
  }
  if (error !== '') {
    return <p className="dash-error">{error}</p>;
  }

  // Đếm số task theo từng trạng thái (dùng vòng for cho dễ hiểu)
  const taskData = [];
  for (let i = 0; i < STATUS_LIST.length; i++) {
    let count = 0;
    for (let j = 0; j < tasks.length; j++) {
      if (tasks[j].status === STATUS_LIST[i].name) {
        count++;
      }
    }
    taskData.push({ name: STATUS_LIST[i].name, value: count, color: STATUS_LIST[i].color });
  }

  // Tổng số file của tất cả dự án
  let totalFiles = 0;
  for (let i = 0; i < projects.length; i++) {
    totalFiles = totalFiles + projects[i].files;
  }

  return (
    <div>
      <h1 className="dash-title">Dashboard</h1>

      <div className="dash-grid">
        {/* Card 1: Projects */}
        <section className="dash-card">
          <div className="dash-card-head">
            <h2>Projects</h2>
            <span className="dash-files"><FiFolder size={22} /> {totalFiles} files</span>
          </div>
          <div className="dash-project-tiles">
            {projects.map(function (p) {
              return (
                <div key={p.id} className={'dash-tile tile-' + p.status}>
                  <strong>{p.title}</strong>
                  <span>{p.status}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Card 2: Tasks (biểu đồ tròn) */}
        <section className="dash-card">
          <div className="dash-card-head">
            <h2>Tasks</h2>
            <select className="dash-select"><option>This Week</option><option>This Month</option></select>
          </div>
          <div className="dash-chart-row">
            <div className="dash-pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskData} dataKey="value" outerRadius="95%" startAngle={90} endAngle={-270} labelLine={false} label={renderPercent} stroke="none">
                    {taskData.map(function (item) {
                      return <Cell key={item.name} fill={item.color} />;
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="dash-legend">
              {taskData.map(function (item) {
                return (
                  <li key={item.name}><i style={{ background: item.color }}></i>{item.name}</li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Card 3: Work Log (biểu đồ vành khuyên) */}
        <section className="dash-card">
          <div className="dash-card-head">
            <h2>Work Log</h2>
            <select className="dash-select"><option>This Week</option><option>This Month</option></select>
          </div>
          <div className="dash-chart-row">
            <div className="dash-pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={workLogs} dataKey="hours" nameKey="product" innerRadius="55%" outerRadius="95%" stroke="none">
                    {workLogs.map(function (item, index) {
                      return <Cell key={item.id} fill={LOG_COLORS[index % LOG_COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="dash-legend small">
              {workLogs.map(function (item, index) {
                return (
                  <li key={item.id}><i style={{ background: LOG_COLORS[index % LOG_COLORS.length] }}></i>{item.product}</li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Card 4: Performance (biểu đồ đường) */}
        <section className="dash-card">
          <div className="dash-card-head">
            <h2>Performance</h2>
            <select className="dash-select"><option>This Week</option><option>This Month</option></select>
          </div>
          <div className="dash-line-legend">
            <span><i style={{ background: '#ff8a65' }}></i>Achieved</span>
            <span><i style={{ background: '#6c4fe0' }}></i>Target</span>
          </div>
          <div className="dash-line">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performance}>
                <CartesianGrid vertical={false} stroke="#eef1f6" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[0, 12]} ticks={[0, 2, 4, 6, 8, 10, 12]} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="achieved" stroke="#ff8a65" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="target" stroke="#6c4fe0" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
