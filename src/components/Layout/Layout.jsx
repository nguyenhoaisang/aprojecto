import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiEdit, FiImage, FiFileText, FiMessageCircle, FiSettings, FiBell, FiSearch, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

// paths: các đường dẫn khiến mục menu này được tô sáng
const leaderMenu = [
  { to: '/overview', paths: ['/overview', '/projects', '/users'], label: 'Project', icon: FiEdit },
  { to: '/tasks', paths: ['/tasks'], label: 'Tasks', icon: FiImage },
  { to: '/work-logs', paths: ['/work-logs'], label: 'Work Logs', icon: FiFileText },
  { to: '/performance', paths: ['/performance'], label: 'Performance', icon: FiMessageCircle },
  { to: '/settings', paths: ['/settings'], label: 'Settings', icon: FiSettings },
];

const staffMenu = [
  { to: '/dashboard', paths: ['/dashboard'], label: 'Home', icon: FiEdit },
  { to: '/projects', paths: ['/projects'], label: 'Project', icon: FiEdit },
].concat(leaderMenu.slice(1));

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  let menu = staffMenu;
  if (user.role === 'leader') {
    menu = leaderMenu;
  }

  function isActive(item) {
    for (let i = 0; i < item.paths.length; i++) {
      if (location.pathname.startsWith(item.paths[i])) {
        return true;
      }
    }
    return false;
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app">
      <header className="header">
        <Link to="/dashboard" className="logo">
          <svg width="44" height="40" viewBox="0 0 44 40">
            <circle cx="20" cy="14" r="12" fill="#1f6a96" />
            <circle cx="14" cy="26" r="11" fill="#7fa8c2" />
            <circle cx="30" cy="27" r="9" fill="#a9c5d8" />
          </svg>
          AProjectO
        </Link>

        <div className="header-right">
          <div className="header-search">
            <FiSearch size={20} />
            <input type="text" placeholder="Search for anything..." />
          </div>
          <button className="bell" title="Thông báo">
            <FiBell size={26} />
            <span className="bell-dot"></span>
          </button>
          <Link to="/profile" className="header-user" title="Xem hồ sơ">
            <div className="header-user-text">
              <strong>{user.name}</strong>
              <span>{user.location}</span>
            </div>
            <img className="avatar" src={user.avatar} alt={user.name} />
          </Link>
        </div>
      </header>

      <div className="body">
        <aside className="sidebar">
          {menu.map(function (item) {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.to} className={isActive(item) ? 'menu-item active' : 'menu-item'}>
                <Icon size={22} />
                {item.label}
              </Link>
            );
          })}

          <button className="menu-item logout" onClick={handleLogout}>
            <FiLogOut size={22} />
            Log out
          </button>
        </aside>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
