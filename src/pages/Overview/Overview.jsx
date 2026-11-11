import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '../../api/api';
import PerformanceChart from '../../components/Charts/PerformanceChart';
import { renderPercent } from '../../components/Charts/renderPercent';
import './Overview.css';

const STATUS_LIST = [
  { name: 'Completed', color: '#23879a' },
  { name: 'OnTrack', color: '#38b6f2' },
  { name: 'Offtrack', color: '#d92d20' },
];

// Trang tổng quan dự án của Leader (Admin_Projects)
function Overview() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(function () {
    Promise.all([api.get('/projects'), api.get('/users'), api.get('/performance')])
      .then(function (results) {
        setProjects(results[0].data);
        setUsers(results[1].data);
        setPerformance(results[2].data);
      })
      .catch(function () { setError('Không tải được dữ liệu. Hãy chắc chắn đã chạy "npm run api".'); })
      .finally(function () { setLoading(false); });
  }, []);

  if (loading) {
    return <p>Đang tải...</p>;
  }
  if (error !== '') {
    return <p className="ov-error">{error}</p>;
  }

  // Đếm số dự án theo từng trạng thái
  const statData = [];
  for (let i = 0; i < STATUS_LIST.length; i++) {
    let count = 0;
    for (let j = 0; j < projects.length; j++) {
      if (projects[j].status === STATUS_LIST[i].name) {
        count++;
      }
    }
    statData.push({ name: STATUS_LIST[i].name, value: count, color: STATUS_LIST[i].color });
  }

  // Danh sách nhân viên (staff) khớp ô tìm kiếm
  const staff = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].role === 'staff') {
      staff.push(users[i]);
    }
  }
  const found = [];
  for (let i = 0; i < staff.length; i++) {
    if (staff[i].name.toLowerCase().includes(search.toLowerCase())) {
      found.push(staff[i]);
    }
  }
  let shownDevs = found;
  if (!showAll) {
    shownDevs = found.slice(0, 14);
  }

  return (
    <div>
      <div className="ov-head">
        <h1>Projects</h1>
        <Link to="/users/create" className="ov-add" title="Thêm nhân viên"><FiPlus size={22} /> Add User</Link>
      </div>

      <div className="ov-grid">
        <section className="ov-card ov-stats">
          <h2>Projects Stats</h2>
          <div className="ov-pie-row">
            <div className="ov-pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statData} dataKey="value" outerRadius="95%" startAngle={90} endAngle={-270} labelLine={false} label={renderPercent} stroke="none">
                    {statData.map(function (item) { return <Cell key={item.name} fill={item.color} />; })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="ov-legend">
              {statData.map(function (item) {
                return <li key={item.name}><i style={{ background: item.color }}></i>{item.name} ({item.value})</li>;
              })}
            </ul>
          </div>
        </section>

        <section className="ov-card ov-perf">
          <h2>Performance</h2>
          <PerformanceChart data={performance} />
        </section>

        <section className="ov-card ov-projects">
          <div className="ov-card-head">
            <h2>Projects</h2>
            <Link to="/projects" className="ov-viewall">View all</Link>
          </div>
          <div className="ov-tiles">
            {projects.slice(0, 9).map(function (p) {
              return (
                <Link key={p.id} to={'/projects/' + p.id} className={'ov-tile ov-' + p.status}>
                  <strong>{p.title.charAt(0)}</strong>
                  <span>{p.title}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="ov-card ov-devs">
          <div className="ov-card-head">
            <h2>UI Developers ({staff.length})</h2>
            <div className="ov-search">
              <FiSearch size={18} />
              <input type="text" placeholder="Search for anything..." value={search} onChange={function (e) { setSearch(e.target.value); }} />
            </div>
            <button className="ov-viewall" onClick={function () { setShowAll(!showAll); }}>{showAll ? 'Show less' : 'View all'}</button>
          </div>
          <div className="ov-avatars">
            {shownDevs.map(function (u) {
              return (
                <Link key={u.id} to={'/profile/' + u.id} className="ov-dev" title={u.name}>
                  <img src={u.avatar} alt={u.name} />
                  <span>{u.name}</span>
                </Link>
              );
            })}
            {shownDevs.length === 0 && <p className="ov-empty">Không tìm thấy nhân viên.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Overview;
