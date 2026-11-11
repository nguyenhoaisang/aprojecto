import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import Pagination from '../../components/Pagination/Pagination';
import './AllProjects.css';

const PAGE_SIZE = 6; // mỗi trang hiện 6 dự án

// Dùng chung cho cả 2 vai trò:
// - Leader: thấy mọi dự án, có nút Create và nút sửa
// - Staff: chỉ thấy dự án mình tham gia, có ô tìm kiếm, bấm tên để xem chi tiết
function AllProjects() {
  const { user } = useAuth();
  const isLeader = user.role === 'leader';

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(function () {
    Promise.all([api.get('/projects'), api.get('/users')])
      .then(function (results) {
        setProjects(results[0].data);
        setUsers(results[1].data);
      })
      .catch(function () {
        setError('Không tải được dữ liệu. Hãy chắc chắn đã chạy "npm run api".');
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  // Tìm danh sách thành viên của 1 dự án từ memberIds
  function getMembers(project) {
    const list = [];
    for (let i = 0; i < project.memberIds.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (users[j].id === project.memberIds[i]) {
          list.push(users[j]);
        }
      }
    }
    return list;
  }

  if (loading) {
    return <p>Đang tải...</p>;
  }
  if (error !== '') {
    return <p className="allp-error">{error}</p>;
  }

  // Lọc dự án: Staff chỉ thấy dự án mình tham gia + lọc theo ô tìm kiếm
  const visible = [];
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const canSee = isLeader || p.memberIds.includes(user.id);
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    if (canSee && matchSearch) {
      visible.push(p);
    }
  }

  let totalPages = Math.ceil(visible.length / PAGE_SIZE);
  if (totalPages === 0) {
    totalPages = 1;
  }
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = visible.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div className="allp-head">
        <h1>Projects</h1>
        {isLeader ? (
          <Link to="/projects/create" className="allp-create">Create</Link>
        ) : (
          <div className="allp-search">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Search for anything..."
              value={search}
              onChange={function (e) { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="allp-empty">
          {isLeader ? 'Chưa có dự án nào. Bấm Create để tạo dự án đầu tiên.' : 'Không có dự án nào phù hợp.'}
        </p>
      ) : (
        <div className="allp-grid">
          {pageItems.map(function (p) {
            return (
              <ProjectCard
                key={p.id}
                project={p}
                members={getMembers(p)}
                canEdit={isLeader}
                linkTo={'/projects/' + p.id}
                deadlinePrefix={isLeader ? '' : 'Deadline : '}
              />
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

export default AllProjects;
